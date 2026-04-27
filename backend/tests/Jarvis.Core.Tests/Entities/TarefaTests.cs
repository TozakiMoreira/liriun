using FluentAssertions;
using Jarvis.Core.Common;
using Jarvis.Core.Entities;
using Jarvis.Core.Enums;

namespace Jarvis.Core.Tests.Entities;

public class TarefaTests
{
    private static readonly Guid UsuarioId = Guid.NewGuid();

    private static Tarefa CriarValida(string nome = "Comprar pao", Prioridade prio = Prioridade.Normal)
        => Tarefa.Criar(UsuarioId, nome, prio).Value!;

    [Fact]
    public void Criar_define_defaults_e_trima_nome()
    {
        Result<Tarefa> r = Tarefa.Criar(UsuarioId, "  Comprar pao  ", Prioridade.Normal);

        r.IsSuccess.Should().BeTrue();
        Tarefa t = r.Value!;
        t.Id.Should().NotBe(Guid.Empty);
        t.UsuarioId.Should().Be(UsuarioId);
        t.Nome.Should().Be("Comprar pao");
        t.Prioridade.Should().Be(Prioridade.Normal);
        t.Status.Should().Be(StatusTarefa.Pendente);
        t.PrazoId.Should().BeNull();
        t.DataPrazo.Should().BeNull();
        t.HorarioFinal.Should().Be(new TimeSpan(23, 59, 0));
        t.ConcluidaEm.Should().BeNull();
        t.Categorias.Should().BeEmpty();
    }

    [Fact]
    public void Criar_normaliza_dataPrazo_pra_data_sem_hora()
    {
        DateTime prazo = new(2026, 5, 10, 14, 30, 0);
        Tarefa t = Tarefa.Criar(UsuarioId, "x", Prioridade.Normal, dataPrazo: prazo).Value!;

        t.DataPrazo.Should().Be(new DateTime(2026, 5, 10));
    }

    [Fact]
    public void Criar_aceita_horarioFinal_customizado()
    {
        TimeSpan hf = new(8, 0, 0);
        Tarefa t = Tarefa.Criar(UsuarioId, "x", Prioridade.Normal, horarioFinal: hf).Value!;

        t.HorarioFinal.Should().Be(hf);
    }

    [Fact]
    public void Criar_falha_quando_usuario_vazio()
    {
        Result<Tarefa> r = Tarefa.Criar(Guid.Empty, "x", Prioridade.Normal);
        r.IsFailure.Should().BeTrue();
        r.Error!.Code.Should().Be("tarefa.usuario-obrigatorio");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Criar_falha_quando_nome_vazio(string? nome)
    {
        Result<Tarefa> r = Tarefa.Criar(UsuarioId, nome!, Prioridade.Normal);
        r.IsFailure.Should().BeTrue();
        r.Error!.Code.Should().Be("tarefa.nome-obrigatorio");
    }

    [Fact]
    public void Criar_falha_quando_nome_passa_de_200_chars()
    {
        string nome = new('a', 201);
        Result<Tarefa> r = Tarefa.Criar(UsuarioId, nome, Prioridade.Normal);
        r.IsFailure.Should().BeTrue();
        r.Error!.Code.Should().Be("tarefa.nome-muito-longo");
    }

    [Fact]
    public void Criar_falha_quando_horarioFinal_invalido()
    {
        Result<Tarefa> r = Tarefa.Criar(UsuarioId, "x", Prioridade.Normal, horarioFinal: TimeSpan.FromHours(25));
        r.IsFailure.Should().BeTrue();
        r.Error!.Code.Should().Be("tarefa.horario-final-invalido");
    }

    [Fact]
    public void Concluir_seta_status_e_data()
    {
        Tarefa t = CriarValida();
        DateTime antes = DateTime.UtcNow.AddSeconds(-1);

        Result r = t.Concluir();

        r.IsSuccess.Should().BeTrue();
        t.Status.Should().Be(StatusTarefa.Concluida);
        t.ConcluidaEm.Should().NotBeNull();
        t.ConcluidaEm!.Value.Should().BeAfter(antes);
    }

    [Fact]
    public void Concluir_falha_se_ja_concluida()
    {
        Tarefa t = CriarValida();
        t.Concluir();

        Result r = t.Concluir();

        r.IsFailure.Should().BeTrue();
        r.Error!.Code.Should().Be("tarefa.ja-concluida");
        r.Error.Type.Should().Be(ErrorType.Conflict);
    }

    [Fact]
    public void Atualizar_modifica_campos_e_revalida()
    {
        Tarefa t = CriarValida();
        Guid prazoId = Guid.NewGuid();
        DateTime data = new(2026, 6, 1, 12, 0, 0);

        Result r = t.Atualizar("novo", Prioridade.Urgente, prazoId, data, new TimeSpan(18, 0, 0));

        r.IsSuccess.Should().BeTrue();
        t.Nome.Should().Be("novo");
        t.Prioridade.Should().Be(Prioridade.Urgente);
        t.PrazoId.Should().Be(prazoId);
        t.DataPrazo.Should().Be(new DateTime(2026, 6, 1));
        t.HorarioFinal.Should().Be(new TimeSpan(18, 0, 0));
    }

    [Fact]
    public void Atualizar_falha_se_concluida()
    {
        Tarefa t = CriarValida();
        t.Concluir();

        Result r = t.Atualizar("y", Prioridade.Normal, null, null, null);

        r.IsFailure.Should().BeTrue();
        r.Error!.Code.Should().Be("tarefa.nao-editavel-concluida");
        r.Error.Type.Should().Be(ErrorType.Conflict);
    }

    [Fact]
    public void Atualizar_aplica_horarioFinal_default_quando_null()
    {
        Tarefa t = Tarefa.Criar(UsuarioId, "x", Prioridade.Normal, horarioFinal: new TimeSpan(8, 0, 0)).Value!;

        t.Atualizar("y", Prioridade.Normal, null, null, null);

        t.HorarioFinal.Should().Be(new TimeSpan(23, 59, 0));
    }

    [Fact]
    public void Atualizar_falha_quando_nome_vazio()
    {
        Tarefa t = CriarValida();
        Result r = t.Atualizar("", Prioridade.Normal, null, null, null);

        r.IsFailure.Should().BeTrue();
        r.Error!.Code.Should().Be("tarefa.nome-obrigatorio");
    }

    [Fact]
    public void StatusComputado_retorna_Concluida_quando_concluida()
    {
        Tarefa t = Tarefa.Criar(UsuarioId, "x", Prioridade.Normal, dataPrazo: DateTime.UtcNow.AddDays(-10)).Value!;
        t.Concluir();

        t.StatusComputado(DateTime.UtcNow).Should().Be(StatusTarefa.Concluida);
    }

    [Fact]
    public void StatusComputado_retorna_Pendente_quando_sem_dataPrazo()
    {
        Tarefa t = CriarValida();
        t.StatusComputado(DateTime.UtcNow).Should().Be(StatusTarefa.Pendente);
    }

    [Fact]
    public void StatusComputado_retorna_Atrasada_quando_passou_do_limite()
    {
        DateTime prazo = new(2026, 4, 20);
        Tarefa t = Tarefa.Criar(UsuarioId, "x", Prioridade.Normal, dataPrazo: prazo, horarioFinal: new TimeSpan(23, 59, 0)).Value!;

        DateTime agora = new(2026, 4, 21, 0, 0, 1);
        t.StatusComputado(agora).Should().Be(StatusTarefa.Atrasada);
    }

    [Fact]
    public void StatusComputado_retorna_Pendente_dentro_do_limite()
    {
        DateTime prazo = new(2026, 4, 20);
        Tarefa t = Tarefa.Criar(UsuarioId, "x", Prioridade.Normal, dataPrazo: prazo, horarioFinal: new TimeSpan(23, 59, 0)).Value!;

        DateTime agora = new(2026, 4, 20, 23, 58, 0);
        t.StatusComputado(agora).Should().Be(StatusTarefa.Pendente);
    }

    [Fact]
    public void StatusComputado_no_limite_exato_e_pendente()
    {
        DateTime prazo = new(2026, 4, 20);
        Tarefa t = Tarefa.Criar(UsuarioId, "x", Prioridade.Normal, dataPrazo: prazo, horarioFinal: new TimeSpan(23, 59, 0)).Value!;

        DateTime limite = prazo.Add(new TimeSpan(23, 59, 0));
        t.StatusComputado(limite).Should().Be(StatusTarefa.Pendente);
    }
}
