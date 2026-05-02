using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Jarvis.Application.Interfaces.Ia;
using Jarvis.Application.Models.Ia;
using Jarvis.Core.Common;
using Jarvis.Core.Errors;
using Microsoft.Extensions.Logging;

namespace Jarvis.Infrastructure.Ia;

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

    public async Task<Result<RespostaConversa>> ConversarAsync(ContextoConversa contexto, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            _logger.LogWarning("Gemini chamado sem API key configurada");
            return Result<RespostaConversa>.Failure(IaErrors.NaoConfigurada());
        }

        string instrucaoSistema = MontarInstrucaoSistema(contexto);
        object body = new
        {
            systemInstruction = new
            {
                parts = new[] { new { text = instrucaoSistema } },
            },
            contents = MontarHistoricoGemini(contexto.Mensagens),
            generationConfig = new
            {
                responseMimeType = "application/json",
                responseSchema = ConstruirResponseSchema(),
                temperature = 0.4,
                maxOutputTokens = 800,
                thinkingConfig = new { thinkingBudget = 0 },
            },
        };

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
                        "Gemini retornou {StatusCode} (tentativa {Tentativa}): {Body}",
                        (int)resp.StatusCode,
                        tentativa,
                        Truncar(corpo, 500));
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

                RespostaConversa? resposta = ParsearResposta(jsonModelo);
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

    private static string MontarInstrucaoSistema(ContextoConversa contexto)
    {
        StringBuilder sb = new();
        sb.Append("Voce e Jarvis, assistente de tarefas (mordomo Homem de Ferro). Estilo seco, primeira pessoa, sem emoji.\n");
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
- titulo: imperativo curto, sem ponto final, max 200ch
- data: YYYY-MM-DD (resolva 'hoje','amanha','sexta','semana que vem'=+7d,'mes que vem'=+1mes; para viagem/projeto use data de INICIO do planejamento, nao a data do evento)
- hora: HH:MM 24h opcional ('18h'=18:00, manha=09:00, tarde=14:00, noite=19:00)
- categoriaIds: array dos ids acima
- prioridade: 1=Urgente 2=Importante 3=Normal 4=Baixa (default 3)
- observacoes: checklist com '- ' por linha, ENRIQUECA tarefas complexas

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
                role = m.Papel == PapelConversa.Jarvis ? "model" : "user",
                parts = new[] { new { text = m.Texto } },
            })
            .ToList();
    }

    private static object ConstruirResponseSchema()
    {
        return new
        {
            type = "OBJECT",
            properties = new
            {
                completo = new { type = "BOOLEAN" },
                mensagem = new { type = "STRING" },
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

    private static RespostaConversa? ParsearResposta(string json)
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

            if (string.IsNullOrWhiteSpace(mensagem) && tarefa is null)
                return null;

            return new RespostaConversa(mensagem, tarefa, completo);
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
}
