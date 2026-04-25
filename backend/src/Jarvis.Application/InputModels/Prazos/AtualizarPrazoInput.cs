using Jarvis.Core.Exceptions;

namespace Jarvis.Application.InputModels.Prazos;

public class AtualizarPrazoInput
{
    public string Nome { get; }
    public int? DuracaoDias { get; }

    public AtualizarPrazoInput(string nome, int? duracaoDias)
    {
        Nome = nome?.Trim() ?? string.Empty;
        DuracaoDias = duracaoDias;
        Validar();
    }

    private void Validar()
    {
        if (string.IsNullOrWhiteSpace(Nome))
            throw new ApplicationLayerException("Nome do prazo é obrigatório");

        if (Nome.Length > 50)
            throw new ApplicationLayerException("Nome do prazo não pode passar de 50 caracteres");

        if (DuracaoDias.HasValue && DuracaoDias.Value < 0)
            throw new ApplicationLayerException("Duração em dias não pode ser negativa");
    }
}
