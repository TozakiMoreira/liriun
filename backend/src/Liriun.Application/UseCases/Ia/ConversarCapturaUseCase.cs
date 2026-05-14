using FluentValidation;
using FluentValidation.Results;
using Liriun.Application.InputModels.Ia;
using Liriun.Application.Interfaces.Auth;
using Liriun.Application.Interfaces.Ia;
using Liriun.Application.Models.Ia;
using Liriun.Application.ReadModels;
using Liriun.Application.ReadRepositories;
using Liriun.Application.ViewModels.Ia;
using Liriun.Core.Common;
using Liriun.Core.Interfaces.Repositories;

namespace Liriun.Application.UseCases.Ia;

public class ConversarCapturaUseCase
{
    private readonly IGeminiService _gemini;
    private readonly ICategoriaReadRepository _categoriaRead;
    private readonly ITarefaReadRepository _tarefaRead;
    private readonly IUsuarioRepository _usuarios;
    private readonly IUsuarioLogado _usuarioLogado;
    private readonly IValidator<ConversarCapturaInput> _validator;

    public ConversarCapturaUseCase(
        IGeminiService gemini,
        ICategoriaReadRepository categoriaRead,
        ITarefaReadRepository tarefaRead,
        IUsuarioRepository usuarios,
        IUsuarioLogado usuarioLogado,
        IValidator<ConversarCapturaInput> validator)
    {
        _gemini = gemini;
        _categoriaRead = categoriaRead;
        _tarefaRead = tarefaRead;
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
                m.Papel == "liriun" ? PapelConversa.Liriun : PapelConversa.Usuario,
                m.Texto.Trim()))
            .ToList();

        (ContextoConversa contexto, IReadOnlyList<CategoriaReadModel> categorias, HashSet<Guid> tarefaIdsValidos) = await MontarContextoAsync(mensagens, NormalizarIdioma(input.Idioma), ct);

        Result<RespostaConversa> respostaResult = await _gemini.ConversarAsync(contexto, ct);
        return MapearResposta(respostaResult, categorias, tarefaIdsValidos);
    }

    public async Task<Result<ConversaCapturaViewModel>> ExecuteComAudioAsync(
        IReadOnlyList<MensagemInput> historico,
        ReadOnlyMemory<byte> audio,
        string mimeType,
        string? idioma,
        CancellationToken ct)
    {
        // Historico pode ser vazio (primeiro turno e o audio). Validamos so o que veio.
        if (historico.Count > 30)
            return Result<ConversaCapturaViewModel>.Failure(
                Error.Validation("ia.validacao", "Conversa muito longa, recomece",
                    new Dictionary<string, string[]> { ["historico"] = new[] { "max 30 mensagens" } }));

        foreach (MensagemInput m in historico)
        {
            if (string.IsNullOrWhiteSpace(m.Texto) || m.Texto.Length > 2000 || (m.Papel != "usuario" && m.Papel != "liriun"))
                return Result<ConversaCapturaViewModel>.Failure(
                    Error.Validation("ia.validacao", "Historico invalido",
                        new Dictionary<string, string[]> { ["historico"] = new[] { "mensagens com papel usuario|liriun e texto 1-2000 chars" } }));
        }

        IReadOnlyList<MensagemConversa> mensagens = historico
            .Select(m => new MensagemConversa(
                m.Papel == "liriun" ? PapelConversa.Liriun : PapelConversa.Usuario,
                m.Texto.Trim()))
            .ToList();

        (ContextoConversa contexto, IReadOnlyList<CategoriaReadModel> categorias, HashSet<Guid> tarefaIdsValidos) = await MontarContextoAsync(mensagens, NormalizarIdioma(idioma), ct);

        Result<RespostaConversa> respostaResult = await _gemini.ConversarComAudioAsync(contexto, audio, mimeType, ct);
        return MapearResposta(respostaResult, categorias, tarefaIdsValidos);
    }

    private static string NormalizarIdioma(string? idioma)
    {
        if (string.IsNullOrWhiteSpace(idioma)) return "pt";
        string lower = idioma.Trim().ToLowerInvariant();
        return lower == "en" ? "en" : "pt";
    }

    private async Task<(ContextoConversa, IReadOnlyList<CategoriaReadModel>, HashSet<Guid>)> MontarContextoAsync(
        IReadOnlyList<MensagemConversa> mensagens, string idioma, CancellationToken ct)
    {
        var usuario = await _usuarios.ObterPorIdAsync(_usuarioLogado.Id, ct);
        IReadOnlyList<CategoriaReadModel> categorias = await _categoriaRead.ListarPorUsuarioAsync(_usuarioLogado.Id, ct);
        IReadOnlyList<TarefaReadModel> pendentes = await _tarefaRead.ListarPendentesAsync(_usuarioLogado.Id, ct);

        // Limita o que vai pro prompt: 30 tarefas mais recentes/atrasadas pra controlar
        // tamanho do contexto (uma tarefa = ~80-120 chars no prompt).
        IReadOnlyList<TarefaContexto> tarefasContexto = pendentes
            .OrderBy(t => t.Status == Core.Enums.StatusTarefa.Atrasada ? 0 : 1)
            .ThenBy(t => t.DataPrazo)
            .Take(30)
            .Select(t => new TarefaContexto(
                t.Id,
                t.Nome,
                t.DataPrazo,
                (int)t.Prioridade,
                (int)t.Status,
                t.Categorias.FirstOrDefault()?.Nome))
            .ToList();

        ContextoConversa contexto = new(
            mensagens,
            usuario?.Nome ?? string.Empty,
            DateTime.UtcNow,
            categorias.Select(c => new CategoriaContexto(c.Id, c.Nome)).ToList(),
            tarefasContexto,
            idioma);

        HashSet<Guid> tarefaIdsValidos = tarefasContexto.Select(t => t.Id).ToHashSet();

        return (contexto, categorias, tarefaIdsValidos);
    }

    private static Result<ConversaCapturaViewModel> MapearResposta(
        Result<RespostaConversa> respostaResult,
        IReadOnlyList<CategoriaReadModel> categorias,
        HashSet<Guid> tarefaIdsValidos)
    {
        if (respostaResult.IsFailure)
            return Result<ConversaCapturaViewModel>.Failure(respostaResult.Error!);

        RespostaConversa resposta = respostaResult.Value!;
        SugestaoTarefaViewModel? tarefa = null;
        AcaoSugeridaViewModel? acaoSugerida = null;

        if (resposta.Acao is AcaoCriar criar)
        {
            AnaliseTarefa a = criar.Tarefa;

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
        else if (resposta.Acao is AcaoConcluir conc && tarefaIdsValidos.Contains(conc.TarefaId))
        {
            acaoSugerida = new AcaoSugeridaViewModel("concluir", conc.TarefaId, null);
        }
        else if (resposta.Acao is AcaoExcluir exc && tarefaIdsValidos.Contains(exc.TarefaId))
        {
            acaoSugerida = new AcaoSugeridaViewModel("excluir", exc.TarefaId, null);
        }
        else if (resposta.Acao is AcaoEditar ed && tarefaIdsValidos.Contains(ed.TarefaId))
        {
            AnaliseTarefa m = ed.Mudancas;

            DateTime hojeEdit = DateTime.UtcNow.Date;
            DateTime? dataMud = m.DataPrazo?.Date >= hojeEdit ? m.DataPrazo?.Date : null;

            HashSet<Guid> categoriasSet = categorias.Select(c => c.Id).ToHashSet();
            IReadOnlyList<Guid> categoriasMud = m.CategoriaIds
                .Where(id => categoriasSet.Contains(id))
                .Distinct()
                .ToList();

            int? prioMud = m.Prioridade is >= 1 and <= 4 ? m.Prioridade : null;

            string? horaMud = null;
            if (m.HorarioFinal.HasValue)
            {
                TimeSpan h = m.HorarioFinal.Value;
                if (h >= TimeSpan.Zero && h < TimeSpan.FromDays(1))
                    horaMud = $"{h.Hours:D2}:{h.Minutes:D2}";
            }

            string? obsMud = string.IsNullOrWhiteSpace(m.Observacoes)
                ? null
                : m.Observacoes.Length > 4000 ? m.Observacoes[..4000] : m.Observacoes;

            bool temAlgumaMudanca =
                !string.IsNullOrWhiteSpace(m.Titulo) ||
                categoriasMud.Count > 0 ||
                dataMud.HasValue ||
                horaMud != null ||
                prioMud.HasValue ||
                obsMud != null;

            if (temAlgumaMudanca)
            {
                SugestaoTarefaViewModel mudancas = new(
                    m.Titulo ?? string.Empty,
                    categoriasMud,
                    dataMud,
                    horaMud,
                    prioMud,
                    obsMud);

                acaoSugerida = new AcaoSugeridaViewModel("editar", ed.TarefaId, mudancas);
            }
            // Mudancas vazias = Gemini emitiu editar sem dados úteis. Cai como conversa
            // (a mensagem dele já deve estar pedindo o que mudar).
        }

        return Result<ConversaCapturaViewModel>.Success(
            new ConversaCapturaViewModel(
                resposta.Mensagem,
                tarefa,
                resposta.Completo,
                resposta.TranscricaoUsuario,
                resposta.TarefasReferenciadas,
                acaoSugerida));
    }
}
