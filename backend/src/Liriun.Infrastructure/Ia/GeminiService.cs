using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Liriun.Application.Interfaces.Ia;
using Liriun.Application.Models.Ia;
using Liriun.Core.Common;
using Liriun.Core.Errors;
using Microsoft.Extensions.Logging;

namespace Liriun.Infrastructure.Ia;

public class GeminiService : IGeminiService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    private readonly HttpClient _http;
    private readonly GeminiOptions _options;
    private readonly ILogger<GeminiService> _logger;

    public GeminiService(HttpClient http, GeminiOptions options, ILogger<GeminiService> logger)
    {
        _http = http;
        _options = options;
        _logger = logger;
    }

    public Task<Result<RespostaConversa>> ConversarAsync(ContextoConversa contexto, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            _logger.LogWarning("Gemini chamado sem API key configurada");
            return Task.FromResult(Result<RespostaConversa>.Failure(IaErrors.NaoConfigurada()));
        }

        object body = new
        {
            systemInstruction = new
            {
                parts = new[] { new { text = MontarInstrucaoSistema(contexto, audio: false) } },
            },
            contents = MontarHistoricoGemini(contexto.Mensagens),
            generationConfig = ConstruirGenerationConfig(audio: false),
        };

        return ChamarGeminiAsync(body, audio: false, ct);
    }

    private string MontarInstrucaoSistema(ContextoConversa contexto, bool audio)
    {
        return _options.ModoInterativo
            ? MontarInstrucaoInterativo(contexto, audio)
            : MontarInstrucaoOneShot(contexto, audio);
    }

    public Task<Result<RespostaConversa>> ConversarComAudioAsync(
        ContextoConversa contexto,
        ReadOnlyMemory<byte> audio,
        string mimeType,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            _logger.LogWarning("Gemini chamado sem API key configurada");
            return Task.FromResult(Result<RespostaConversa>.Failure(IaErrors.NaoConfigurada()));
        }

        if (audio.IsEmpty)
        {
            _logger.LogWarning("Gemini chamado com audio vazio");
            return Task.FromResult(Result<RespostaConversa>.Failure(IaErrors.RespostaInvalida()));
        }

        List<object> contents = MontarHistoricoGemini(contexto.Mensagens);
        // O turno novo do usuario e um audio: vai como ultimo "user" content com inlineData.
        contents.Add(new
        {
            role = "user",
            parts = new object[]
            {
                new
                {
                    inlineData = new
                    {
                        mimeType,
                        data = Convert.ToBase64String(audio.Span),
                    },
                },
            },
        });

        object body = new
        {
            systemInstruction = new
            {
                parts = new[] { new { text = MontarInstrucaoSistema(contexto, audio: true) } },
            },
            contents,
            generationConfig = ConstruirGenerationConfig(audio: true),
        };

        return ChamarGeminiAsync(body, audio: true, ct);
    }

    private async Task<Result<RespostaConversa>> ChamarGeminiAsync(object body, bool audio, CancellationToken ct)
    {
        string url = $"{_options.BaseUrl}/models/{_options.Model}:generateContent?key={_options.ApiKey}";

        // Tenta 2 vezes — Gemini eventualmente trava em respostas com schema. Segunda chamada quase sempre vai.
        for (int tentativa = 1; tentativa <= 2; tentativa++)
        {
            try
            {
                HttpResponseMessage resp = await _http.PostAsJsonAsync(url, body, JsonOptions, ct);
                string corpo = await resp.Content.ReadAsStringAsync(ct);

                if (!resp.IsSuccessStatusCode)
                {
                    _logger.LogError(
                        "Gemini retornou {StatusCode} (tentativa {Tentativa}, audio={Audio}, modelo={Modelo}): {Body}",
                        (int)resp.StatusCode,
                        tentativa,
                        audio,
                        _options.Model,
                        Truncar(corpo, 1500));
                    if ((int)resp.StatusCode == 429)
                    {
                        // Rate limit do free tier OU quota diaria zerada OU billing issue.
                        // Body do Google traz "RESOURCE_EXHAUSTED" + razao real.
                        return Result<RespostaConversa>.Failure(IaErrors.LimiteExcedido(ExtrairRetryEmSegundos(corpo)));
                    }
                    if ((int)resp.StatusCode == 400 || (int)resp.StatusCode == 404)
                    {
                        // Modelo nao existe/deprecated, ou key invalida pra esse modelo.
                        return Result<RespostaConversa>.Failure(IaErrors.NaoConfigurada());
                    }
                    if ((int)resp.StatusCode == 401 || (int)resp.StatusCode == 403)
                    {
                        return Result<RespostaConversa>.Failure(IaErrors.NaoConfigurada());
                    }
                    if (tentativa == 2) return Result<RespostaConversa>.Failure(IaErrors.FalhaNaAnalise());
                    continue;
                }

                string? jsonModelo = ExtrairTextoDaResposta(corpo);
                if (jsonModelo is null)
                {
                    _logger.LogError("Gemini devolveu resposta sem texto (tentativa {Tentativa}): {Body}", tentativa, Truncar(corpo, 500));
                    if (tentativa == 2) return Result<RespostaConversa>.Failure(IaErrors.RespostaInvalida());
                    continue;
                }

                RespostaConversa? resposta = ParsearResposta(jsonModelo, audio);
                if (resposta is null)
                {
                    _logger.LogError("Nao consegui parsear o JSON do Gemini (tentativa {Tentativa}): {Json}", tentativa, Truncar(jsonModelo, 500));
                    if (tentativa == 2) return Result<RespostaConversa>.Failure(IaErrors.RespostaInvalida());
                    continue;
                }

                return Result<RespostaConversa>.Success(resposta);
            }
            catch (TaskCanceledException) when (ct.IsCancellationRequested)
            {
                throw;
            }
            catch (TaskCanceledException ex)
            {
                _logger.LogWarning(ex, "Gemini timeout de {Timeout}s (tentativa {Tentativa})", _options.TimeoutSeconds, tentativa);
                if (tentativa == 2) return Result<RespostaConversa>.Failure(IaErrors.Timeout());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Falha chamando Gemini (tentativa {Tentativa})", tentativa);
                if (tentativa == 2) return Result<RespostaConversa>.Failure(IaErrors.FalhaNaAnalise());
            }
        }

        return Result<RespostaConversa>.Failure(IaErrors.FalhaNaAnalise());
    }

    private object ConstruirGenerationConfig(bool audio) => new
    {
        responseMimeType = "application/json",
        responseSchema = ConstruirResponseSchema(audio),
        temperature = 0.4,
        maxOutputTokens = 800,
        thinkingConfig = new { thinkingBudget = 0 },
    };

    /// <summary>
    /// Modo one-shot (default). Nao pergunta nada. Sempre fecha a tarefa com o que o usuario disse.
    /// Campos faltantes ficam null pro usuario completar na UI de revisao. Observacoes copiam o
    /// "onde/como" cru, sem reescrever nem enriquecer.
    /// </summary>
    private static string MontarInstrucaoOneShot(ContextoConversa contexto, bool audio)
    {
        StringBuilder sb = new();
        bool en = contexto.Idioma == "en";
        if (en)
        {
            sb.Append("You are Liriun, task assistant. Dry style, first person, no emoji.\n");
            sb.Append("RESPOND ONLY IN ENGLISH. Field 'mensagem' must be in English. Field 'titulo' (task name) must keep the user's original language.\n");
        }
        else
        {
            sb.Append("Voce e Liriun, assistente de tarefas. Estilo seco, primeira pessoa, sem emoji.\n");
            sb.Append("RESPONDA SEMPRE EM PORTUGUES BRASILEIRO. Campo 'mensagem' em pt-BR.\n");
        }
        if (audio)
        {
            string langName = en ? "the user's spoken language" : "portugues";
            sb.Append($"A ULTIMA mensagem do usuario neste turno e um AUDIO. Voce DEVE OBRIGATORIAMENTE preencher 'transcricaoUsuario' com a transcricao literal em {langName} (palavra por palavra, sem reescrever). NAO PODE deixar em branco.\n");
        }
        sb.Append($"Hoje: {contexto.HojeUtc:yyyy-MM-dd} ({contexto.HojeUtc:dddd}).\n");
        if (!string.IsNullOrWhiteSpace(contexto.NomeUsuario))
            sb.Append($"Usuario: {contexto.NomeUsuario}.\n");

        if (contexto.Categorias.Count > 0)
        {
            sb.Append("Categorias (so use estes ids):\n");
            foreach (CategoriaContexto c in contexto.Categorias)
                sb.Append($"  {c.Id} = {c.Nome}\n");
        }
        else
        {
            sb.Append("Sem categorias cadastradas. categoriaIds = [].\n");
        }

        if (contexto.TarefasPendentes.Count > 0)
        {
            sb.Append("\nTarefas pendentes do usuario (use estes IDs quando precisar referenciar uma tarefa existente):\n");
            foreach (TarefaContexto t in contexto.TarefasPendentes)
            {
                string statusLabel = t.Status == 3 ? "atrasada" : "pendente";
                string prioLabel = t.Prioridade switch { 1 => "urgente", 2 => "importante", 4 => "baixa", _ => "normal" };
                string catLabel = t.CategoriaNome is null ? "sem categoria" : t.CategoriaNome;
                sb.Append($"  {t.Id} = \"{t.Titulo}\" - {t.DataPrazo:yyyy-MM-dd} - {prioLabel} - {statusLabel} - {catLabel}\n");
            }
        }

        sb.Append(@"
Modo ONE-SHOT. NAO faca perguntas pra coletar campos de tarefa.

VOCE SEMPRE retorna o campo 'acao' com a classificacao do turno. Tipos validos:
  - 'criar'     -> nova tarefa (ou ajuste/confirmacao de tarefa pre-save)
  - 'conversar' -> sem acao, so resposta textual (inclui CONSULTA sobre tarefas existentes)
  - 'concluir'  -> marcar tarefa da lista como feita
  - 'editar'    -> mudar campos de tarefa existente
  - 'excluir'   -> apagar tarefa da lista

IMPORTANTE: concluir/editar/excluir NAO sao executados direto — o front mostra um card
de confirmacao pro usuario aprovar. SEMPRE seja CONSERVADOR: so emita essas acoes
quando o usuario for EXPLICITO. Se houver duvida, vire acao=conversar e pergunte qual
tarefa, ou explique o que voce entendeu.

CLASSIFICACAO DO TURNO (SEMPRE faca isso primeiro):
1. NOVA TAREFA: usuario descreveu uma coisa pra fazer/lembrar. -> acao=criar com tarefa preenchida. completo=true.
2. AJUSTE PRE-SAVE: usuario quer mudar algo da tarefa anterior que ainda NAO foi salva ('muda data pra sexta', 'sem categoria', 'na verdade e amanha'). -> acao=criar reaproveitando campos do turno anterior + mudancas. completo=true.
3. CONFIRMACAO de save: usuario disse 'salva', 'ok', 'pode salvar', 'sim', 'manda ver'. -> acao=criar mantem tarefa anterior intacta. completo=true. mensagem: 'Salvando.' ou 'Anotado.'.
4. CONSULTA sobre tarefas existentes: usuario pergunta sobre algo que ele JA tem na lista acima ('pra onde eu ia viajar mesmo?', 'qual e meu proximo medico?', 'tenho algo pra fazer hoje?', 'o que ta atrasado?', 'me lembra o que falta da viagem'). -> acao=conversar. completo=true. Olhe a LISTA DE TAREFAS acima, encontre as relevantes e responda no mensagem.
   - Cite o(s) titulo(s) + data quando relevante (formato curto: 'sexta', '15 de jun', 'amanha').
   - Se achar UMA tarefa relacionada, responda direto: 'Voce tem reuniao com cliente na sexta, 14h.'
   - Se achar VARIAS (2-4), liste resumido: 'Voce tem 3 coisas hoje: dentista 14h, mercado, reuniao 18h.'
   - Se achar MUITAS (5+), agrupe: 'Voce tem 7 pendentes essa semana. Quer que eu detalhe algum grupo?'
   - Se NAO achar nada relacionado, seja honesto: 'Nao achei nada sobre isso na sua lista.' (NAO invente tarefa).
   - NUNCA emita acao=criar pra consulta. NUNCA crie tarefa nova num turno de consulta.
   - SEMPRE preencha 'tarefasReferenciadas' com os IDs (UUIDs) das tarefas que voce citou na mensagem (max 6, na ordem em que aparecem na resposta). Vazio se NAO achou nada relacionado.
5. CONCLUIR tarefa existente ('pode concluir essa', 'feito, marca como feita', 'ja terminei o mercado', 'concluida'): -> acao=concluir com tarefaId apontando pra tarefa da lista. mensagem: 'Concluir [titulo]?' (curto, confirmando). completo=true.
6. EXCLUIR/APAGAR tarefa existente ('pode apagar', 'remove essa', 'deleta a reuniao', 'tira da lista'): -> acao=excluir com tarefaId. mensagem: 'Excluir [titulo]?'. completo=true. Use EXCLUIR pra remover totalmente (sem virar 'concluida').
7. EDITAR tarefa existente ('muda a data pra sexta', 'troca a categoria pra trabalho', 'remarca a reuniao pras 16h'): -> acao=editar com tarefaId + mudancas (so os campos que mudam, resto null). mensagem: 'Editar [titulo]: [resumo das mudancas]?'. completo=true.
   - Em mudancas, deixe campos NAO mencionados como null. NAO repita valores existentes.
   - Ex: usuario diz 'muda a reuniao com cliente pra terca' -> mudancas={ data:'2026-XX-XX' }, todos os outros campos null.
8. PERGUNTA/CONVERSA: usuario pergunta algo de fora da lista, pede recomendacao, faz papo, pede ajuda externa. -> acao=conversar. completo=true. mensagem responde curto e seco em primeira pessoa.

REGRAS PRA CONCLUIR/EXCLUIR/EDITAR (importante):
- tarefaId DEVE ser um UUID que aparece na LISTA DE TAREFAS acima. NUNCA invente UUIDs.
- Se o usuario falar de uma tarefa que NAO esta na lista, vire acao=conversar e diga 'Nao achei essa tarefa na sua lista.'
- Se houver AMBIGUIDADE (2+ tarefas com nomes parecidos), vire acao=conversar e pergunte qual: 'Tem 2 com esse nome: [a] sexta 14h, [b] segunda 18h. Qual?'
- USE o contexto do turno anterior pra desambiguar (se usuario citou uma tarefa recente e disse 'apaga essa', 'concluir essa', refere-se a ela).

REGRA PRA PERGUNTA/CONVERSA (caso 5):
- Responda na 'mensagem' em ate 2 frases curtas, primeira pessoa, sem emoji.
- Pode citar NOMES de sites/apps/servicos conhecidos quando seguro ('Booking, Decolar, Trivago pra hospedagem'; 'Uber/99 pra carro'; 'iFood pra comida').
- NUNCA invente URLs ou links — so cite nomes.
- Se nao souber ou for fora do seu escopo (financeiro pessoal, medico especifico, juridico): seja honesto seco ('Nao posso indicar com seguranca, da uma busca rapida').
- NAO modifique nem crie tarefa por causa da pergunta. acao=conversar.

Extraia o que o usuario DISSE NESTE TURNO. Campos sem informacao = null (NAO chute, NAO invente).

REGRAS DE TITULO (importante — preencha SEMPRE com algo util):
1. Foque APENAS no turno atual do usuario. NAO reaproveite titulos/palavras de turnos anteriores a menos que o novo turno seja ajuste do mesmo (ex: 'muda data pra sexta').
2. Se o usuario fala um SUBSTANTIVO com prazo ('tenho psi amanha', 'consulta dia 15', 'reuniao quinta'), INFIRA o verbo imperativo natural:
   - 'tenho psi/psicologo/terapia X' -> 'Sessao de psicologia' (ou 'Consulta com psicologo')
   - 'tenho medico/dr./dentista X' -> 'Consulta com medico' (ajuste especialidade se citada)
   - 'tenho reuniao/call/meet X' -> 'Reuniao' (+ tema se citado)
   - 'tenho aula/prova/curso X' -> 'Aula de X' / 'Prova de X'
   - 'tenho academia/treino X' -> 'Treino na academia'
   - 'tenho viagem/voo X' -> 'Viajar pra Y' / 'Embarcar voo X'
   - 'comprar/pagar/levar/buscar/ligar/enviar' = ja tem verbo, use direto
3. Se o usuario diz so um lembrete tipo 'aniversario do joao quarta' -> 'Aniversario do Joao'.
4. NUNCA use 'salvar', 'anotar', 'tarefa', 'nova', 'ok' como titulo — sao acoes de sistema, nao tarefas.
5. Sem ponto final. Max 200ch. NAO inclua data/hora no titulo.
6. So se MESMO assim nao houver substantivo claro ou acao implicita, copie as primeiras 6-8 palavras crus.

REGRAS DE DATA:
- YYYY-MM-DD apenas com pista explicita ('hoje', 'amanha', 'sexta', '15/08', 'dia 5', 'semana que vem'=+7d, 'mes que vem'=+1mes, 'sexta da semana que vem'). null caso contrario.

REGRAS DE HORA:
- HH:MM 24h apenas se mencionada ('19h'=19:00, '18h30'=18:30, 'manha'=09:00, 'tarde'=14:00, 'noite'=19:00, 'meio-dia'=12:00). null caso contrario.

REGRAS DE CATEGORIA:
- SEMPRE escolha 1 categoria razoavel das disponiveis. NAO deixe [] por preguica nem por nao ser 'obvio' — pense em qual area da vida do usuario a tarefa pertence.
- Heuristica: qual dessas categorias melhor agrupa essa tarefa no dia-a-dia?
- Exemplos:
  * 'comprar pao' + ['Compras','Casa','Trabalho'] -> 'Compras' (obvio).
  * 'instalar linux no notebook' + ['Trabalho','Pessoal','Casa','Estudos'] -> 'Pessoal' (item tecnico do PC pessoal).
  * 'reuniao com cliente' + ['Trabalho','Pessoal'] -> 'Trabalho'.
  * 'lavar louca' + ['Casa','Trabalho'] -> 'Casa'.
  * 'estudar matematica' + ['Faculdade','Estudos','Trabalho'] -> 'Faculdade' (se existir) ou 'Estudos'.
  * 'consulta no dentista' + ['Saude','Pessoal'] -> 'Saude'.
- So deixe [] quando NENHUMA categoria existente tiver minima relacao com a tarefa, ou quando o usuario disser explicitamente 'sem categoria'.
- Maximo 1 categoria (a melhor). NAO marque varias por seguranca.

REGRAS DE PRIORIDADE:
- 1=Urgente (palavras 'urgente', 'agora', 'asap', 'emergencia')
- 2=Importante ('importante', prazo no mesmo dia critico)
- 3=Normal (default)
- 4=Baixa ('quando der', 'sem pressa')

OBSERVACOES:
- COPIE CRU o 'onde/como' que o usuario falou, sem reescrever, sem enriquecer, sem checklist.
- NAO repita dados ja em titulo/data/hora. null se nao houver onde/como.

MENSAGEM:
- 1 frase curta, primeira pessoa, sem emoji.
- Se faltou DATA ou HORA, mencione SECO o que faltou pra ajustar.
- NUNCA mencione categoria na mensagem — voce ja escolheu uma das disponiveis (ou [] silencioso se nenhuma encaixa).
- Exemplos: 'Anotado.' / 'Anotado. Faltou hora.' / 'Anotado. Sem data, ajusta se quiser.'
- NUNCA 'Faltou o que fazer' se voce conseguiu inferir um titulo. So diga isso se titulo realmente ficou impossivel.

EXEMPLOS:
Input: 'tenho psi amanha'
-> acao: { tipo: 'criar', tarefa: { titulo: 'Sessao de psicologia', data: '<amanha>', hora: null, observacoes: null } }, mensagem: 'Anotado. Sem hora, ajusta se quiser.'

Input: 'comprar pao'
-> acao: { tipo: 'criar', tarefa: { titulo: 'Comprar pao', data: null } }, mensagem: 'Anotado. Sem prazo definido.'

Input: 'reuniao com cliente sexta 14h sobre proposta'
-> acao: { tipo: 'criar', tarefa: { titulo: 'Reuniao com cliente', data: '<sexta>', hora: '14:00', observacoes: 'sobre proposta' } }, mensagem: 'Anotado.'

Input (turno seguinte a 'comprar hospedagem pra madrid amanha'): 'pode me indicar sites pra isso?'
-> acao: { tipo: 'conversar' }, mensagem: 'Booking, Decolar e Trivago costumam funcionar pra hospedagem. Pra Madrid tambem da pra olhar Airbnb.'

Input (turno seguinte a uma tarefa): 'salva'
-> acao: { tipo: 'criar', tarefa: <mantem campos do turno anterior> }, mensagem: 'Salvando.'

Input: 'qual a previsao do tempo amanha?'
-> acao: { tipo: 'conversar' }, mensagem: 'Nao tenho acesso a clima. Olha no Google ou Climatempo.'

Input (com tarefa 'Comprar pao' na lista de pendentes): 'concluí o pao'
-> acao: { tipo: 'conversar' }, mensagem: 'Ainda nao consigo concluir tarefas por voz, mas em breve.'

completo: SEMPRE true.
");

        return sb.ToString();
    }

    /// <summary>
    /// Modo interativo. Liriun faz ate 3 perguntas de contexto antes de fechar e enriquece
    /// observacoes com checklist. Reservado pra plano pago futuro — habilitado via
    /// <see cref="GeminiOptions.ModoInterativo"/>.
    /// </summary>
    private static string MontarInstrucaoInterativo(ContextoConversa contexto, bool audio)
    {
        StringBuilder sb = new();
        sb.Append("Voce e Liriun, assistente de tarefas (mordomo Homem de Ferro). Estilo seco, primeira pessoa, sem emoji.\n");
        if (audio)
        {
            sb.Append("A ULTIMA mensagem do usuario neste turno e um AUDIO. Voce DEVE OBRIGATORIAMENTE preencher o campo 'transcricaoUsuario' com a transcricao literal em portugues (palavra por palavra, sem reescrever, sem resumir, sem corrigir gramatica). NAO PODE deixar em branco mesmo que o audio seja curto, repetido, monossilabico ou apenas confirmacao tipo 'sim'/'salva'. A transcricao e usada como entrada da sua analise normal e tambem mostrada ao usuario na UI como bolha do chat.\n");
        }
        sb.Append($"Hoje: {contexto.HojeUtc:yyyy-MM-dd} ({contexto.HojeUtc:dddd}).\n");
        if (!string.IsNullOrWhiteSpace(contexto.NomeUsuario))
            sb.Append($"Usuario: {contexto.NomeUsuario}.\n");

        if (contexto.Categorias.Count > 0)
        {
            sb.Append("Categorias (so use estes ids):\n");
            foreach (CategoriaContexto c in contexto.Categorias)
                sb.Append($"  {c.Id} = {c.Nome}\n");
        }
        else
        {
            sb.Append("Sem categorias cadastradas. Nao pergunte sobre categoria; categoriaIds = [].\n");
        }

        sb.Append(@"
Saida JSON (responseSchema garante estrutura):
- titulo: imperativo curto, sem ponto final, max 200ch. NAO inclua data nem hora no titulo (vao em campos separados).
- data: YYYY-MM-DD. EXTRAIA SEMPRE quando o usuario der QUALQUER pista temporal: 'hoje', 'amanha'/'amanhã', 'depois de amanha', 'sexta', 'segunda que vem', 'dia 19', 'semana que vem'=+7d, 'mes que vem'=+1mes, '15/08'. Nunca deixe null se houver pista. So omita se o usuario realmente nao mencionou prazo. Para VIAGEM/PROJETO use data de INICIO do planejamento.
- hora: HH:MM 24h. EXTRAIA SEMPRE quando aparecer: '19h'=19:00, '18h30'=18:30, '7 da noite'=19:00, 'manha'=09:00, 'tarde'=14:00, 'noite'=19:00, 'meio dia'=12:00. So omita se nada de hora foi dito.
- categoriaIds: array dos ids acima
- prioridade: 1=Urgente 2=Importante 3=Normal 4=Baixa (default 3)
- observacoes: checklist com '- ' por linha, ENRIQUECA tarefas complexas. Nao repita aqui dados que ja foram pra titulo/data/hora.

Comportamento:
1. Falta titulo ou data: pergunte (completo=false, tarefa=null).
2. Tem titulo+data: faca 1-2 perguntas de CONTEXTO conforme tema. Maximo 3 perguntas totais.
3. Usuario diz 'salva'/'sim'/'ta bom'/'pode anotar' OU ja tem info suficiente: feche (completo=true) com observacoes em formato lista.
4. Mensagens 1-2 frases. Humor sutil ok ('imagino que ainda nao tenha hospedagem').

Cookbook de contexto (pergunte 1-2 itens relevantes, depois feche):
- VIAGEM: passagem comprada?, hospedagem?, roteiro?, documentos?
- REUNIAO: com quem?, presencial/online?, pauta?, link?
- ESTUDO/PROVA: materia, conteudo, material
- COMPRAS: itens, lugar, orcamento
- PROJETO/TRABALHO: entregavel, dependencias, bloqueio
- EXERCICIO: tipo, lugar, duracao
- SAUDE/MEDICO: especialidade, lugar, jejum/preparo
- PAGAMENTO: valor, forma, vencimento
- EVENTO SOCIAL: lugar, com quem, presente/dress code
Outros temas: bom senso — o que obviamente falta?

REGRA CHAVE: se o usuario JA RESPONDEU os pontos principais (ex: 'tenho passagem e hospedagem' apos pergunta de viagem), NAO pergunte mais nada — FECHE com observacoes resumindo o que foi acordado e o que ainda falta resolver.

Exemplo reuniao curta com data+hora explicitas:
U: 'tenho reuniao com pedro amanha as 19h online sobre nossa startup'
V: {completo:true, mensagem:'Anotado.', tarefa:{titulo:'Reuniao com Pedro sobre startup', data:'<amanha>', hora:'19:00', observacoes:'- Com: Pedro\n- Online\n- Tema: startup'}}

Exemplo viagem:
U: 'vou viajar pra recife em janeiro'
V: {completo:false, mensagem:'Que dia voce comeca a se organizar? Imagino que passagem e hospedagem ainda estejam abertos.', tarefa:null}
U: 'comeca quinta, ja tenho passagem mas nao hospedagem'
V: {completo:true, mensagem:'Anotado. Coloquei o que falta nas observacoes.', tarefa:{titulo:'Planejar viagem para Recife', data:'<quinta>', observacoes:'- Passagem: ja comprada\n- Reservar hospedagem em Recife\n- Montar roteiro de atracoes\n- Conferir documentos'}}");

        return sb.ToString();
    }

    private static List<object> MontarHistoricoGemini(IReadOnlyList<MensagemConversa> mensagens)
    {
        // Gemini espera "user" e "model"
        return mensagens
            .Select(m => (object)new
            {
                role = m.Papel == PapelConversa.Liriun ? "model" : "user",
                parts = new[] { new { text = m.Texto } },
            })
            .ToList();
    }

    private static object ConstruirResponseSchema(bool audio)
    {
        // Schema da resposta. Acao e polimorfica via discriminador `tipo`. Campos
        // nested (tarefa, tarefaId, mudancas, filtros) sao opcionais e usados conforme
        // o tipo. Fase 1: prompt instrui Gemini a so emitir `criar` ou `conversar`.
        return new
        {
            type = "OBJECT",
            properties = new
            {
                completo = new { type = "BOOLEAN" },
                mensagem = new { type = "STRING" },
                transcricaoUsuario = new { type = "STRING", description = "Transcricao literal, em portugues, do audio enviado pelo usuario neste turno." },
                tarefasReferenciadas = new
                {
                    type = "ARRAY",
                    description = "IDs das tarefas da LISTA acima que voce citou/referenciou na mensagem (consultas). Vazio quando nao for consulta. Max 6 IDs.",
                    items = new { type = "STRING" },
                },
                acao = new
                {
                    type = "OBJECT",
                    properties = new
                    {
                        tipo = new { type = "STRING", description = "criar | conversar | concluir | editar | excluir" },
                        tarefaId = new { type = "STRING", nullable = true, description = "UUID da tarefa-alvo (concluir/editar/excluir). Null nos outros tipos." },
                        tarefa = new
                        {
                            type = "OBJECT",
                            nullable = true,
                            description = "Preenchido quando tipo=criar. Os campos da nova tarefa.",
                            properties = new
                            {
                                titulo = new { type = "STRING" },
                                categoriaIds = new
                                {
                                    type = "ARRAY",
                                    items = new { type = "STRING" },
                                },
                                data = new { type = "STRING", description = "YYYY-MM-DD" },
                                hora = new { type = "STRING", description = "HH:MM 24h" },
                                prioridade = new { type = "INTEGER", description = "1, 2, 3 ou 4" },
                                observacoes = new { type = "STRING" },
                            },
                        },
                        mudancas = new
                        {
                            type = "OBJECT",
                            nullable = true,
                            description = "Preenchido quando tipo=editar. SOMENTE campos a alterar (resto null).",
                            properties = new
                            {
                                titulo = new { type = "STRING" },
                                categoriaIds = new
                                {
                                    type = "ARRAY",
                                    items = new { type = "STRING" },
                                },
                                data = new { type = "STRING", description = "YYYY-MM-DD" },
                                hora = new { type = "STRING", description = "HH:MM 24h" },
                                prioridade = new { type = "INTEGER" },
                                observacoes = new { type = "STRING" },
                            },
                        },
                    },
                    required = new[] { "tipo" },
                },
            },
            required = new[] { "completo", "mensagem", "acao" },
        };
    }

    private static string? ExtrairTextoDaResposta(string corpo)
    {
        using JsonDocument doc = JsonDocument.Parse(corpo);
        if (!doc.RootElement.TryGetProperty("candidates", out JsonElement candidates) || candidates.GetArrayLength() == 0)
            return null;

        JsonElement primeiro = candidates[0];
        if (!primeiro.TryGetProperty("content", out JsonElement content)) return null;
        if (!content.TryGetProperty("parts", out JsonElement parts) || parts.GetArrayLength() == 0) return null;

        JsonElement primeiraParte = parts[0];
        if (!primeiraParte.TryGetProperty("text", out JsonElement text)) return null;

        return text.GetString();
    }

    private static RespostaConversa? ParsearResposta(string json, bool audio)
    {
        try
        {
            using JsonDocument doc = JsonDocument.Parse(json);
            JsonElement root = doc.RootElement;

            string mensagem = root.TryGetProperty("mensagem", out JsonElement m)
                ? (m.GetString() ?? string.Empty).Trim()
                : string.Empty;

            bool completo = root.TryGetProperty("completo", out JsonElement c)
                && c.ValueKind == JsonValueKind.True;

            string? transcricao = null;
            if (audio && root.TryGetProperty("transcricaoUsuario", out JsonElement tr) && tr.ValueKind == JsonValueKind.String)
            {
                string? raw = tr.GetString();
                if (!string.IsNullOrWhiteSpace(raw))
                    transcricao = raw.Trim();
            }

            // Parse acao (polimorfica via discriminador `tipo`).
            // Compat: se vier o formato antigo com `tarefa` direto na raiz, trata como AcaoCriar.
            AcaoIA acao = ParsearAcao(root);

            // Lista de IDs de tarefas que o agente referenciou na mensagem (consultas).
            List<Guid>? referencias = null;
            if (root.TryGetProperty("tarefasReferenciadas", out JsonElement refsEl) && refsEl.ValueKind == JsonValueKind.Array)
            {
                foreach (JsonElement item in refsEl.EnumerateArray())
                {
                    if (item.ValueKind != JsonValueKind.String) continue;
                    if (Guid.TryParse(item.GetString(), out Guid id))
                    {
                        referencias ??= new List<Guid>();
                        if (!referencias.Contains(id)) referencias.Add(id);
                        if (referencias.Count >= 6) break;
                    }
                }
            }

            if (string.IsNullOrWhiteSpace(mensagem) && acao is AcaoConversar)
                return null;

            return new RespostaConversa(mensagem, acao, completo, transcricao, referencias);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static AcaoIA ParsearAcao(JsonElement root)
    {
        // Formato novo: campo top-level `acao` com `tipo` discriminador.
        if (root.TryGetProperty("acao", out JsonElement acao) && acao.ValueKind == JsonValueKind.Object)
        {
            string tipo = acao.TryGetProperty("tipo", out JsonElement tipoEl) && tipoEl.ValueKind == JsonValueKind.String
                ? (tipoEl.GetString() ?? string.Empty).Trim().ToLowerInvariant()
                : string.Empty;

            switch (tipo)
            {
                case "criar":
                    if (acao.TryGetProperty("tarefa", out JsonElement tarefaCriar) && tarefaCriar.ValueKind == JsonValueKind.Object)
                    {
                        AnaliseTarefa? t = ParsearTarefa(tarefaCriar);
                        if (t is not null) return new AcaoCriar(t);
                    }
                    // Tipo criar mas sem dados aproveitaveis — degrade graceful pra conversar.
                    return new AcaoConversar();

                case "conversar":
                case "consultar":
                    return new AcaoConversar();

                case "concluir":
                    if (acao.TryGetProperty("tarefaId", out JsonElement tIdConc) &&
                        tIdConc.ValueKind == JsonValueKind.String &&
                        Guid.TryParse(tIdConc.GetString(), out Guid idConc))
                    {
                        return new AcaoConcluir(idConc);
                    }
                    return new AcaoConversar();

                case "excluir":
                    if (acao.TryGetProperty("tarefaId", out JsonElement tIdExc) &&
                        tIdExc.ValueKind == JsonValueKind.String &&
                        Guid.TryParse(tIdExc.GetString(), out Guid idExc))
                    {
                        return new AcaoExcluir(idExc);
                    }
                    return new AcaoConversar();

                case "editar":
                    if (acao.TryGetProperty("tarefaId", out JsonElement tIdEd) &&
                        tIdEd.ValueKind == JsonValueKind.String &&
                        Guid.TryParse(tIdEd.GetString(), out Guid idEd) &&
                        acao.TryGetProperty("mudancas", out JsonElement mud) &&
                        mud.ValueKind == JsonValueKind.Object)
                    {
                        AnaliseTarefa? mudancas = ParsearTarefa(mud);
                        if (mudancas is not null) return new AcaoEditar(idEd, mudancas);
                    }
                    return new AcaoConversar();

                default:
                    return new AcaoConversar();
            }
        }

        // Compat: formato antigo (apenas `tarefa` na raiz, sem `acao`).
        if (root.TryGetProperty("tarefa", out JsonElement tarefaLegado) && tarefaLegado.ValueKind == JsonValueKind.Object)
        {
            AnaliseTarefa? t = ParsearTarefa(tarefaLegado);
            if (t is not null) return new AcaoCriar(t);
        }

        return new AcaoConversar();
    }

    private static AnaliseTarefa? ParsearTarefa(JsonElement t)
    {
        string titulo = t.TryGetProperty("titulo", out JsonElement tit) ? (tit.GetString() ?? string.Empty).Trim() : string.Empty;
        if (string.IsNullOrWhiteSpace(titulo)) return null;
        if (titulo.Length > 200) titulo = titulo[..200];

        List<Guid> categorias = new();
        if (t.TryGetProperty("categoriaIds", out JsonElement catArr) && catArr.ValueKind == JsonValueKind.Array)
        {
            foreach (JsonElement c in catArr.EnumerateArray())
            {
                if (c.ValueKind == JsonValueKind.String && Guid.TryParse(c.GetString(), out Guid id))
                    categorias.Add(id);
            }
        }

        DateTime? data = null;
        if (t.TryGetProperty("data", out JsonElement dataEl) && dataEl.ValueKind == JsonValueKind.String
            && DateTime.TryParse(dataEl.GetString(), out DateTime parsedData))
        {
            data = parsedData.Date;
        }

        TimeSpan? hora = null;
        if (t.TryGetProperty("hora", out JsonElement horaEl) && horaEl.ValueKind == JsonValueKind.String)
        {
            string? raw = horaEl.GetString();
            if (!string.IsNullOrWhiteSpace(raw) && TryParseHoraTolerante(raw, out TimeSpan parsedHora))
                hora = parsedHora;
        }

        int? prioridade = null;
        if (t.TryGetProperty("prioridade", out JsonElement prioEl)
            && prioEl.ValueKind == JsonValueKind.Number
            && prioEl.TryGetInt32(out int p))
        {
            prioridade = p;
        }

        string? observacoes = null;
        if (t.TryGetProperty("observacoes", out JsonElement obsEl) && obsEl.ValueKind == JsonValueKind.String)
        {
            string? raw = obsEl.GetString();
            if (!string.IsNullOrWhiteSpace(raw))
                observacoes = raw.Trim();
        }

        return new AnaliseTarefa(titulo, categorias, data, hora, prioridade, observacoes);
    }

    /// <summary>
    /// Aceita "18:00", "18h", "18", "18h30", "6:00 PM" — tudo vira TimeSpan 24h.
    /// </summary>
    private static bool TryParseHoraTolerante(string raw, out TimeSpan ts)
    {
        ts = default;
        string s = raw.Trim().ToLowerInvariant();

        // Formato HH:MM padrao
        if (TimeSpan.TryParse(s, out ts) && ts >= TimeSpan.Zero && ts < TimeSpan.FromDays(1))
            return true;

        // "18h" ou "18h30"
        if (s.Contains('h'))
        {
            string[] partes = s.Split('h', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            if (partes.Length >= 1 && int.TryParse(partes[0], out int hh) && hh is >= 0 and < 24)
            {
                int mm = 0;
                if (partes.Length >= 2 && !int.TryParse(partes[1], out mm))
                    mm = 0;
                if (mm is < 0 or >= 60) mm = 0;
                ts = new TimeSpan(hh, mm, 0);
                return true;
            }
        }

        // "18" puro
        if (int.TryParse(s, out int hourOnly) && hourOnly is >= 0 and < 24)
        {
            ts = new TimeSpan(hourOnly, 0, 0);
            return true;
        }

        return false;
    }

    private static string Truncar(string s, int max) => s.Length <= max ? s : s[..max];

    /// <summary>
    /// Tenta extrair "Please retry in 16.243s" do payload de erro 429 do Gemini.
    /// Tambem olha em RetryInfo.retryDelay quando presente.
    /// </summary>
    private static int? ExtrairRetryEmSegundos(string corpo)
    {
        try
        {
            using JsonDocument doc = JsonDocument.Parse(corpo);
            if (doc.RootElement.TryGetProperty("error", out JsonElement err))
            {
                if (err.TryGetProperty("message", out JsonElement msg) && msg.ValueKind == JsonValueKind.String)
                {
                    string texto = msg.GetString() ?? string.Empty;
                    System.Text.RegularExpressions.Match m = System.Text.RegularExpressions.Regex.Match(
                        texto, @"retry in (\d+(?:\.\d+)?)s");
                    if (m.Success && double.TryParse(m.Groups[1].Value, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out double s))
                    {
                        return (int)Math.Ceiling(s);
                    }
                }
            }
        }
        catch
        {
            // payload nao-json ou estrutura diferente — silencia
        }
        return null;
    }
}
