using Jarvis.Core.Exceptions;

namespace Jarvis.Application.InputModels.Categorias;

public class CriarCategoriaInput
{
    public string Nome { get; }

    public CriarCategoriaInput(string nome)
    {
        Nome = nome?.Trim() ?? string.Empty;
        Validar();
    }

    private void Validar()
    {
        if (string.IsNullOrWhiteSpace(Nome))
            throw new ApplicationLayerException("Nome da categoria é obrigatório");

        if (Nome.Length > 50)
            throw new ApplicationLayerException("Nome da categoria não pode passar de 50 caracteres");
    }
}
