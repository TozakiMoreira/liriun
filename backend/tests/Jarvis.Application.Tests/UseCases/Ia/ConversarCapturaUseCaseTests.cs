using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Jarvis.Application.InputModels.Ia;
using Jarvis.Application.Interfaces.Auth;
using Jarvis.Application.Interfaces.Ia;
using Jarvis.Application.Models.Ia;
using Jarvis.Application.ReadModels;
using Jarvis.Application.ReadRepositories;
using Jarvis.Application.UseCases.Ia;
using Jarvis.Application.ViewModels.Ia;
using Jarvis.Core.Common;
using Jarvis.Core.Entities;
using Jarvis.Core.Errors;
using Jarvis.Core.Interfaces.Repositories;
using Moq;

namespace Jarvis.Application.Tests.UseCases.Ia;

public class ConversarCapturaUseCaseTests
{
    private readonly Mock<IGeminiService> _gemini = new();
    private readonly Mock<ICategoriaReadRepository> _categoriaRead = new();
    private readonly Mock<IUsuarioRepository> _usuarios = new();
    private readonly Mock<IUsuarioLogado> _usuarioLogado = new();
    private readonly Mock<IValidator<ConversarCapturaInput>> _validator = new();
    private readonly Usuario _usuario;
    private readonly Guid _categoriaTrabalho = Guid.NewGuid();

    public ConversarCapturaUseCaseTests()
    {
        _usuario = Usuario.Criar("Lucas", "lucas@ex.com", "hash").Value!;
        _usuarioLogado.SetupGet(u => u.Id).Returns(_usuario.Id);
        _usuarios.Setup(r => r.ObterPorIdAsync(_usuario.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(_usuario);
        _validator.Setup(v => v.ValidateAsync(It.IsAny<ConversarCapturaInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());
        _categoriaRead.Setup(r => r.ListarPorUsuarioAsync(_usuario.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new[]
            {
                new CategoriaReadModel(_categoriaTrabalho, "Trabalho", DateTime.UtcNow),
            });
    }

    private ConversarCapturaUseCase Criar()
        => new(_gemini.Object, _categoriaRead.Object, _usuarios.Object, _usuarioLogado.Object, _validator.Object);

    private static ConversarCapturaInput Mensagens(params (string papel, string texto)[] msgs)
        => new(msgs.Select(m => new MensagemInput(m.papel, m.texto)).ToList());

    [Fact]
    public async Task Devolve_apenas_mensagem_quando_bot_pergunta_mais_info()
    {
        _gemini.Setup(g => g.ConversarAsync(It.IsAny<ContextoConversa>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result<RespostaConversa>.Success(
                new RespostaConversa("Pra que dia?", null, false)));

        Result<ConversaCapturaViewModel> result = await Criar().ExecuteAsync(
            Mensagens(("usuario", "preciso reunir com pedro")), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Mensagem.Should().Be("Pra que dia?");
        result.Value.Tarefa.Should().BeNull();
        result.Value.Completo.Should().BeFalse();
    }

    [Fact]
    public async Task Devolve_tarefa_quando_bot_fecha_completo()
    {
        DateTime amanha = DateTime.UtcNow.Date.AddDays(1);
        _gemini.Setup(g => g.ConversarAsync(It.IsAny<ContextoConversa>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result<RespostaConversa>.Success(new RespostaConversa(
                "Anotado.",
                new AnaliseTarefa(
                    "Reunir com Pedro",
                    new[] { _categoriaTrabalho },
                    amanha,
                    new TimeSpan(18, 0, 0),
                    null,
                    null),
                true)));

        Result<ConversaCapturaViewModel> result = await Criar().ExecuteAsync(
            Mensagens(("usuario", "salva")), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Completo.Should().BeTrue();
        result.Value.Tarefa.Should().NotBeNull();
        result.Value.Tarefa!.Titulo.Should().Be("Reunir com Pedro");
        result.Value.Tarefa.DataPrazo.Should().Be(amanha);
        result.Value.Tarefa.HorarioFinal.Should().Be("18:00");
        result.Value.Tarefa.CategoriaIds.Should().ContainSingle().Which.Should().Be(_categoriaTrabalho);
    }

    [Fact]
    public async Task Filtra_categoria_que_nao_pertence_ao_usuario()
    {
        Guid intrusa = Guid.NewGuid();
        _gemini.Setup(g => g.ConversarAsync(It.IsAny<ContextoConversa>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result<RespostaConversa>.Success(new RespostaConversa(
                "Anotado.",
                new AnaliseTarefa("X", new[] { intrusa }, DateTime.UtcNow.Date.AddDays(1), null, null, null),
                true)));

        Result<ConversaCapturaViewModel> result = await Criar().ExecuteAsync(
            Mensagens(("usuario", "salva")), CancellationToken.None);

        result.Value!.Tarefa!.CategoriaIds.Should().BeEmpty();
    }

    [Fact]
    public async Task Zera_data_passada_sugerida_pela_ia()
    {
        DateTime ontem = DateTime.UtcNow.Date.AddDays(-1);
        _gemini.Setup(g => g.ConversarAsync(It.IsAny<ContextoConversa>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result<RespostaConversa>.Success(new RespostaConversa(
                "Anotado.",
                new AnaliseTarefa("X", Array.Empty<Guid>(), ontem, null, null, null),
                true)));

        Result<ConversaCapturaViewModel> result = await Criar().ExecuteAsync(
            Mensagens(("usuario", "salva")), CancellationToken.None);

        result.Value!.Tarefa!.DataPrazo.Should().BeNull();
    }

    [Fact]
    public async Task Propaga_falha_do_gemini()
    {
        _gemini.Setup(g => g.ConversarAsync(It.IsAny<ContextoConversa>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result<RespostaConversa>.Failure(IaErrors.FalhaNaAnalise()));

        Result<ConversaCapturaViewModel> result = await Criar().ExecuteAsync(
            Mensagens(("usuario", "qualquer")), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Code.Should().Be("ia.falha-na-analise");
    }

    [Fact]
    public async Task Retorna_validation_quando_validator_falha()
    {
        _validator.Setup(v => v.ValidateAsync(It.IsAny<ConversarCapturaInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult(new[] { new ValidationFailure("Mensagens", "vazio") }));

        Result<ConversaCapturaViewModel> result = await Criar().ExecuteAsync(
            Mensagens(), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error!.Type.Should().Be(ErrorType.Validation);
        _gemini.Verify(g => g.ConversarAsync(It.IsAny<ContextoConversa>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
