using Jarvis.Core.Common;
using Jarvis.Core.Errors;

namespace Jarvis.Core.Entities;

public class Prazo
{
    public Guid Id { get; private set; }
    public Guid UsuarioId { get; private set; }
    public string Nome { get; private set; } = null!;
    public int? DuracaoDias { get; private set; }
    public DateTime CriadoEm { get; private set; }

    private Prazo() { }

    internal static Prazo Reconstituir(Guid id, Guid usuarioId, string nome, int? duracaoDias, DateTime criadoEm)
        => new() { Id = id, UsuarioId = usuarioId, Nome = nome, DuracaoDias = duracaoDias, CriadoEm = criadoEm };

    public static Result<Prazo> Criar(Guid usuarioId, string nome, int? duracaoDias)
    {
        Prazo prazo = new()
        {
            Id = Guid.NewGuid(),
            UsuarioId = usuarioId,
            Nome = nome?.Trim() ?? string.Empty,
            DuracaoDias = duracaoDias,
            CriadoEm = DateTime.UtcNow
        };

        Result validacao = prazo.Validar();
        if (validacao.IsFailure)
            return Result<Prazo>.Failure(validacao.Error!);

        return Result<Prazo>.Success(prazo);
    }

    public DateTime? ResolverDataPrazo(DateTime referencia)
    {
        if (!DuracaoDias.HasValue)
            return null;

        return referencia.Date.AddDays(DuracaoDias.Value);
    }

    public Result Atualizar(string novoNome, int? novaDuracao)
    {
        Nome = novoNome?.Trim() ?? string.Empty;
        DuracaoDias = novaDuracao;
        return Validar();
    }

    private Result Validar()
    {
        if (UsuarioId == Guid.Empty)
            return Result.Failure(PrazoErrors.UsuarioObrigatorio());

        if (string.IsNullOrWhiteSpace(Nome))
            return Result.Failure(PrazoErrors.NomeObrigatorio());

        if (Nome.Length > 50)
            return Result.Failure(PrazoErrors.NomeMuitoLongo());

        if (DuracaoDias.HasValue && DuracaoDias.Value < 0)
            return Result.Failure(PrazoErrors.DuracaoNegativa());

        return Result.Success();
    }
}
