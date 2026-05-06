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
        sb.Append("Voce e Liriun, assistente de tarefas. Estilo seco, primeira pessoa, sem emoji.\n");
        if (audio)
        {
            sb.Append("A ULTIMA mensagem do usuario neste turno e um AUDIO. Voce DEVE OBRIGATORIAMENTE preencher 'transcricaoUsuario' com a transcricao literal em portugues (palavra por palavra, sem reescrever). NAO PODE deixar em branco.\n");
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

        sb.Append(@"
Modo ONE-SHOT. NAO faca perguntas pra coletar campos de tarefa.

CLASSIFICACAO DO TURNO (SEMPRE faca isso primeiro):
1. NOVA TAREFA: usuario descreveu uma coisa pra fazer/lembrar. -> Cria tarefa nova preenchendo campos. completo=true.
2. AJUSTE: usuario quer mudar algo da tarefa anterior ('muda data pra sexta', 'sem categoria', 'na verdade e amanha'). -> Reaproveita campos da tarefa anterior, ajusta o que mudou. completo=true.
3. CONFIRMACAO: usuario disse 'salva', 'ok', 'pode salvar', 'sim', 'manda ver'. -> Mantem tarefa anterior intacta. completo=true. mensagem: 'Salvando.' ou 'Anotado.'.
4. PERGUNTA/CONVERSA: usuario pergunta algo, pede recomendacao, faz papo, pede ajuda externa. -> tarefa=null. completo=true. mensagem responde curto e seco em primeira pessoa.

REGRA PRA PERGUNTA/CONVERSA (caso 4):
- Responda na 'mensagem' em ate 2 frases curtas, primeira pessoa, sem emoji.
- Pode citar NOMES de sites/apps/servicos conhecidos quando seguro ('Booking, Decolar, Trivago pra hospedagem'; 'Uber/99 pra carro'; 'iFood pra comida').
- NUNCA invente URLs ou links — so cite nomes.
- Se nao souber ou for fora do seu escopo (financeiro pessoal, medico especifico, juridico): seja honesto seco ('Nao posso indicar com seguranca, da uma busca rapida').
- NAO modifique nem crie tarefa por causa da pergunta. tarefa=null.

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
- Use ids OBVIOS do texto (ex: 'comprar pao' + categoria 'Compras' existe -> use). [] em duvida.

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
- Se faltou data, hora, categoria ou local relevante, mencione SECO o que faltou pra ajustar.
- Exemplos: 'Anotado.' / 'Anotado. Faltou hora.' / 'Anotado. Sem data, ajusta se quiser.'
- NUNCA 'Faltou o que fazer' se voce conseguiu inferir um titulo. So diga isso se titulo realmente ficou impossivel.

EXEMPLOS:
Input: 'tenho psi amanha'
-> tarefa: { titulo: 'Sessao de psicologia', data: '<amanha>', hora: null, observacoes: null }, mensagem: 'Anotado. Sem hora, ajusta se quiser.'

Input: 'comprar pao'
-> tarefa: { titulo: 'Comprar pao', data: null }, mensagem: 'Anotado. Sem prazo definido.'

Input: 'reuniao com cliente sexta 14h sobre proposta'
-> tarefa: { titulo: 'Reuniao com cliente', data: '<sexta>', hora: '14:00', observacoes: 'sobre proposta' }, mensagem: 'Anotado.'

Input (turno seguinte a 'comprar hospedagem pra madrid amanha'): 'pode me indicar sites pra isso?'
-> tarefa: null, mensagem: 'Booking, Decolar e Trivago costumam funcionar pra hospedagem. Pra Madrid tambem da pra olhar Airbnb.'

Input (turno seguinte a uma tarefa): 'salva'
-> tarefa: <mantem campos do turno anterior>, mensagem: 'Salvando.'

Input: 'qual a previsao do tempo amanha?'
-> tarefa: null, mensagem: 'Nao tenho acesso a clima. Olha no Google ou Climatempo.'

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
        return new
        {
            type = "OBJECT",
            properties = new
            {
                completo = new { type = "BOOLEAN" },
                mensagem = new { type = "STRING" },
                transcricaoUsuario = new { type = "STRING", description = "Transcricao literal, em portugues, do audio enviado pelo usuario neste turno." },
                tarefa = new
                {
                    type = "OBJECT",
                    nullable = true,
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
            },
            required = new[] { "completo", "mensagem" },
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

            AnaliseTarefa? tarefa = null;
            if (root.TryGetProperty("tarefa", out JsonElement t) && t.ValueKind == JsonValueKind.Object)
            {
                tarefa = ParsearTarefa(t);
            }

            string? transcricao = null;
            if (audio && root.TryGetProperty("transcricaoUsuario", out JsonElement tr) && tr.ValueKind == JsonValueKind.String)
            {
                string? raw = tr.GetString();
                if (!string.IsNullOrWhiteSpace(raw))
                    transcricao = raw.Trim();
            }

            if (string.IsNullOrWhiteSpace(mensagem) && tarefa is null)
                return null;

            return new RespostaConversa(mensagem, tarefa, completo, transcricao);
        }
        catch (JsonException)
        {
            return null;
        }
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
