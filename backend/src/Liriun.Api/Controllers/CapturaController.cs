using System.Text.Json;
using Liriun.Api.Extensions;
using Liriun.Application.InputModels.Ia;
using Liriun.Application.UseCases.Ia;
using Liriun.Application.ViewModels.Ia;
using Liriun.Core.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Liriun.Api.Controllers;

[ApiController]
[Authorize]
[Route("captura")]
public class CapturaController : ControllerBase
{
    private const long AudioMaxBytes = 8 * 1024 * 1024; // 8 MB ~ 60s opus
    private static readonly string[] AudioMimesPermitidos =
    {
        "audio/webm",
        "audio/ogg",
        "audio/mp4",
        "audio/mpeg",
        "audio/wav",
        "audio/x-wav",
        "audio/aac",
        "audio/flac",
    };

    private static readonly JsonSerializerOptions HistoricoJson = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    [HttpPost("conversar")]
    public async Task<IActionResult> Conversar(
        [FromBody] ConversarCapturaInput input,
        [FromServices] ConversarCapturaUseCase useCase,
        CancellationToken ct)
    {
        Result<ConversaCapturaViewModel> result = await useCase.ExecuteAsync(input, ct);
        return result.ToActionResult(view => Ok(view));
    }

    [HttpPost("conversar-audio")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(AudioMaxBytes + 64 * 1024)]
    public async Task<IActionResult> ConversarComAudio(
        [FromForm] ConversarComAudioForm form,
        [FromServices] ConversarCapturaUseCase useCase,
        CancellationToken ct)
    {
        IFormFile? audio = form.Audio;
        if (audio is null || audio.Length == 0)
            return BadRequest(ProblemaSimples("audio.invalido", "Audio nao recebido"));

        if (audio.Length > AudioMaxBytes)
            return BadRequest(ProblemaSimples("audio.invalido", $"Audio maior que {AudioMaxBytes / (1024 * 1024)} MB"));

        string mime = ExtrairMimeBase(audio.ContentType);
        if (!AudioMimesPermitidos.Contains(mime))
            return BadRequest(ProblemaSimples("audio.invalido", $"Formato {mime} nao suportado"));

        IReadOnlyList<MensagemInput> historico = Array.Empty<MensagemInput>();
        if (!string.IsNullOrWhiteSpace(form.Historico))
        {
            try
            {
                historico = JsonSerializer.Deserialize<List<MensagemInput>>(form.Historico, HistoricoJson)
                    ?? new List<MensagemInput>();
            }
            catch (JsonException)
            {
                return BadRequest(ProblemaSimples("historico.invalido", "Historico nao e um JSON valido"));
            }
        }

        byte[] bytes;
        await using (Stream stream = audio.OpenReadStream())
        await using (MemoryStream ms = new())
        {
            await stream.CopyToAsync(ms, ct);
            bytes = ms.ToArray();
        }

        Result<ConversaCapturaViewModel> result = await useCase.ExecuteComAudioAsync(historico, bytes, mime, ct);
        return result.ToActionResult(view => Ok(view));
    }

    public sealed class ConversarComAudioForm
    {
        public IFormFile? Audio { get; set; }
        public string? Historico { get; set; }
    }

    private static string ExtrairMimeBase(string? contentType)
    {
        if (string.IsNullOrWhiteSpace(contentType)) return string.Empty;
        int sep = contentType.IndexOf(';');
        return (sep < 0 ? contentType : contentType[..sep]).Trim().ToLowerInvariant();
    }

    private static ProblemDetails ProblemaSimples(string code, string detail) => new()
    {
        Type = $"https://liriun-api/erros/{code}",
        Title = code,
        Status = StatusCodes.Status400BadRequest,
        Detail = detail,
    };
}
