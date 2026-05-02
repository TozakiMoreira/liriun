using FluentValidation;
using FluentValidation.Results;
using Jarvis.Application.InputModels.Ia;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.Interfaces.Ia;
using Jarvis.Application.Models.Ia;
using Jarvis.Application.ReadModels;
using Jarvis.Application.ReadRepositories;
using Jarvis.Application.ViewModels.Ia;
using Jarvis.Core.Common;
using Jarvis.Core.Interfaces.Repositories;

namespace Jarvis.Application.UseCases.Ia;

public class ConversarCapturaUseCase
{
    private readonly IGeminiService _gemini;
    private readonly ICategoriaReadRepository _categoriaRead;
    private readonly IUsuarioRepository _usuarios;
    private readonly IUsuarioLogado _usuarioLogado;
    private readonly IValidator<ConversarCapturaInput> _validator;

    public ConversarCapturaUseCase(
        IGeminiService gemini,
        ICategoriaReadRepository categoriaRead,
        IUsuarioRepository usuarios,
        IUsuarioLogado usuarioLogado,
        IValidator<ConversarCapturaInput> validator)
    {
        _gemini = gemini;
        _categoriaRead = categoriaRead;
        _usuarios = usuarios;
        _usuarioLogado = usuarioLogado;
        _validator = validator;
    }

    public async Task<Result<ConversaCapturaViewModel>> ExecuteAsync(ConversarCapturaInput input, CancellationToken ct)
    {
        ValidationResult validation = await _validator.ValidateAsync(input, ct);
        if (!validation.IsValid)
        {
            Dictionary<string, string[]> details = validation.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            return Result<ConversaCapturaViewModel>.Failure(
                Error.Validation("ia.validacao", "Dados invalidos", details));
        }

        IReadOnlyList<MensagemConversa> mensagens = input.Mensagens
            .Select(m => new MensagemConversa(
                m.Papel == "jarvis" ? PapelConversa.Jarvis : PapelConversa.Usuario,
                m.Texto.Trim()))
            .ToList();

        (ContextoConversa contexto, IReadOnlyList<CategoriaReadModel> categorias) = await MontarContextoAsync(mensagens, ct);

        Result<RespostaConversa> respostaResult = await _gemini.ConversarAsync(contexto, ct);
        return MapearResposta(respostaResult, categorias);
    }

    public async Task<Result<ConversaCapturaViewModel>> ExecuteComAudioAsync(
        IReadOnlyList<MensagemInput> historico,
        ReadOnlyMemory<byte> audio,
        string mimeType,
        CancellationToken ct)
    {
        // Historico pode ser vazio (primeiro turno e o audio). Validamos so o que veio.
        if (historico.Count > 30)
            return Result<ConversaCapturaViewModel>.Failure(
                Error.Validation("ia.validacao", "Conversa muito longa, recomece",
                    new Dictionary<string, string[]> { ["historico"] = new[] { "max 30 mensagens" } }));

        foreach (MensagemInput m in historico)
        {
            if (string.IsNullOrWhiteSpace(m.Texto) || m.Texto.Length > 2000 || (m.Papel != "usuario" && m.Papel != "jarvis"))
                return Result<ConversaCapturaViewModel>.Failure(
                    Error.Validation("ia.validacao", "Historico invalido",
                        new Dictionary<string, string[]> { ["historico"] = new[] { "mensagens com papel usuario|jarvis e texto 1-2000 chars" } }));
        }

        IReadOnlyList<MensagemConversa> mensagens = historico
            .Select(m => new MensagemConversa(
                m.Papel == "jarvis" ? PapelConversa.Jarvis : PapelConversa.Usuario,
                m.Texto.Trim()))
            .ToList();

        (ContextoConversa contexto, IReadOnlyList<CategoriaReadModel> categorias) = await MontarContextoAsync(mensagens, ct);

        Result<RespostaConversa> respostaResult = await _gemini.ConversarComAudioAsync(contexto, audio, mimeType, ct);
        return MapearResposta(respostaResult, categorias);
    }

    private async Task<(ContextoConversa, IReadOnlyList<CategoriaReadModel>)> MontarContextoAsync(
        IReadOnlyList<MensagemConversa> mensagens, CancellationToken ct)
    {
        var usuario = await _usuarios.ObterPorIdAsync(_usuarioLogado.Id, ct);
        IReadOnlyList<CategoriaReadModel> categorias = await _categoriaRead.ListarPorUsuarioAsync(_usuarioLogado.Id, ct);

        ContextoConversa contexto = new(
            mensagens,
            usuario?.Nome ?? string.Empty,
            DateTime.UtcNow,
            categorias.Select(c => new CategoriaContexto(c.Id, c.Nome)).ToList());

        return (contexto, categorias);
    }

    private static Result<ConversaCapturaViewModel> MapearResposta(
        Result<RespostaConversa> respostaResult,
        IReadOnlyList<CategoriaReadModel> categorias)
    {
        if (respostaResult.IsFailure)
            return Result<ConversaCapturaViewModel>.Failure(respostaResult.Error!);

        RespostaConversa resposta = respostaResult.Value!;
        SugestaoTarefaViewModel? tarefa = null;

        if (resposta.Tarefa is not null)
        {
            AnaliseTarefa a = resposta.Tarefa;

            // Filtros defensivos contra alucinacao
            DateTime hoje = DateTime.UtcNow.Date;
            DateTime? dataValida = a.DataPrazo?.Date >= hoje ? a.DataPrazo?.Date : null;

            HashSet<Guid> categoriasValidasSet = categorias.Select(c => c.Id).ToHashSet();
            IReadOnlyList<Guid> categoriasFiltradas = a.CategoriaIds
                .Where(id => categoriasValidasSet.Contains(id))
                .Distinct()
                .ToList();

            int? prioridadeValida = a.Prioridade is >= 1 and <= 4 ? a.Prioridade : null;

            string? horaFormatada = null;
            if (a.HorarioFinal.HasValue)
            {
                TimeSpan h = a.HorarioFinal.Value;
                if (h >= TimeSpan.Zero && h < TimeSpan.FromDays(1))
                    horaFormatada = $"{h.Hours:D2}:{h.Minutes:D2}";
            }

            string? observacoesValidas = string.IsNullOrWhiteSpace(a.Observacoes)
                ? null
                : a.Observacoes.Length > 4000 ? a.Observacoes[..4000] : a.Observacoes;

            tarefa = new SugestaoTarefaViewModel(
                a.Titulo,
                categoriasFiltradas,
                dataValida,
                horaFormatada,
                prioridadeValida,
                observacoesValidas);
        }

        return Result<ConversaCapturaViewModel>.Success(
            new ConversaCapturaViewModel(resposta.Mensagem, tarefa, resposta.Completo, resposta.TranscricaoUsuario));
    }
}
