namespace Jarvis.Core.Exceptions;

/// <summary>
/// Exceção genérica lançada pela camada Application (UseCases, Services, InputModels).
/// Uso típico:
///   throw new ApplicationLayerException("Tarefa não encontrada", 404);
///   throw new ApplicationLayerException("Senha muito curta");
/// </summary>
public class ApplicationLayerException : DomainException
{
    public ApplicationLayerException(string message, int statusCode = 400, string errorCode = "REGRA_APLICACAO")
        : base(message, statusCode, errorCode) { }
}
