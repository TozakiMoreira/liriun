namespace Liriun.Core.Enums;

/// <summary>
/// Categorias fixas pra lançamentos financeiros.
/// 1-99 = receita, 100+ = despesa. Mantém ordem numérica pra evolução.
/// </summary>
public enum CategoriaLancamento
{
    // Receitas
    Salario = 1,
    Freelance = 2,
    Investimento = 3,
    OutrosGanhos = 9,

    // Despesas
    Moradia = 100,
    Alimentacao = 101,
    Transporte = 102,
    Saude = 103,
    Educacao = 104,
    Lazer = 105,
    Servicos = 106,
    Compras = 107,
    OutrasDespesas = 199
}
