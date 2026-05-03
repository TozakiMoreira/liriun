using FluentAssertions;
using Liriun.Core.Common;
using Liriun.Core.Errors;

namespace Liriun.Core.Tests.Errors;

public class ErrorsTests
{
    [Theory]
    [InlineData(nameof(TarefaErrors.UsuarioObrigatorio), "tarefa.usuario-obrigatorio", ErrorType.Validation)]
    [InlineData(nameof(TarefaErrors.NomeObrigatorio), "tarefa.nome-obrigatorio", ErrorType.Validation)]
    [InlineData(nameof(TarefaErrors.NomeMuitoLongo), "tarefa.nome-muito-longo", ErrorType.Validation)]
    [InlineData(nameof(TarefaErrors.HorarioFinalInvalido), "tarefa.horario-final-invalido", ErrorType.Validation)]
    [InlineData(nameof(TarefaErrors.JaConcluida), "tarefa.ja-concluida", ErrorType.Conflict)]
    [InlineData(nameof(TarefaErrors.NaoEditavelConcluida), "tarefa.nao-editavel-concluida", ErrorType.Conflict)]
    [InlineData(nameof(TarefaErrors.NaoEncontrada), "tarefa.nao-encontrada", ErrorType.NotFound)]
    [InlineData(nameof(TarefaErrors.CategoriasInvalidas), "tarefa.categorias-invalidas", ErrorType.Validation)]
    public void TarefaErrors_definidos_com_code_e_tipo(string metodo, string code, ErrorType tipo)
    {
        Error e = (Error)typeof(TarefaErrors).GetMethod(metodo)!.Invoke(null, null)!;
        e.Code.Should().Be(code);
        e.Type.Should().Be(tipo);
        e.Message.Should().NotBeNullOrWhiteSpace();
    }

    [Theory]
    [InlineData(nameof(CategoriaErrors.NomeObrigatorio), "categoria.nome-obrigatorio", ErrorType.Validation)]
    [InlineData(nameof(CategoriaErrors.NaoEncontrada), "categoria.nao-encontrada", ErrorType.NotFound)]
    [InlineData(nameof(CategoriaErrors.NomeJaExiste), "categoria.nome-ja-existe", ErrorType.Conflict)]
    [InlineData(nameof(CategoriaErrors.PossuiTarefasPendentes), "categoria.possui-tarefas-pendentes", ErrorType.Conflict)]
    public void CategoriaErrors_definidos_com_code_e_tipo(string metodo, string code, ErrorType tipo)
    {
        Error e = (Error)typeof(CategoriaErrors).GetMethod(metodo)!.Invoke(null, null)!;
        e.Code.Should().Be(code);
        e.Type.Should().Be(tipo);
    }

    [Theory]
    [InlineData(nameof(UsuarioErrors.NomeObrigatorio), "usuario.nome-obrigatorio", ErrorType.Validation)]
    [InlineData(nameof(UsuarioErrors.EmailInvalido), "usuario.email-invalido", ErrorType.Validation)]
    [InlineData(nameof(UsuarioErrors.SenhaObrigatoria), "usuario.senha-obrigatoria", ErrorType.Validation)]
    [InlineData(nameof(UsuarioErrors.EmailJaCadastrado), "usuario.email-ja-cadastrado", ErrorType.Conflict)]
    [InlineData(nameof(UsuarioErrors.CredenciaisInvalidas), "usuario.credenciais-invalidas", ErrorType.Unauthorized)]
    public void UsuarioErrors_definidos_com_code_e_tipo(string metodo, string code, ErrorType tipo)
    {
        Error e = (Error)typeof(UsuarioErrors).GetMethod(metodo)!.Invoke(null, null)!;
        e.Code.Should().Be(code);
        e.Type.Should().Be(tipo);
    }
}
