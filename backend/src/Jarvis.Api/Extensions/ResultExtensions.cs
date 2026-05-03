using Jarvis.Core.Common;
using Microsoft.AspNetCore.Mvc;

namespace Jarvis.Api.Extensions;

public static class ResultExtensions
{
    public static IActionResult ToActionResult(this Result result, Func<IActionResult> onSuccess)
    {
        if (result.IsSuccess)
            return onSuccess();

        return ToProblemDetails(result.Error!);
    }

    public static IActionResult ToActionResult<T>(this Result<T> result, Func<T, IActionResult> onSuccess)
    {
        if (result.IsSuccess)
            return onSuccess(result.Value!);

        return ToProblemDetails(result.Error!);
    }

    private static ObjectResult ToProblemDetails(Error error)
    {
        int statusCode = error.Type switch
        {
            ErrorType.Validation => StatusCodes.Status400BadRequest,
            ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            ErrorType.Forbidden => StatusCodes.Status403Forbidden,
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            ErrorType.Failure => StatusCodes.Status500InternalServerError,
            _ => StatusCodes.Status500InternalServerError
        };

        ProblemDetails problem = new()
        {
            Type = $"https://liriun-api/erros/{error.Code}",
            Title = error.Code,
            Status = statusCode,
            Detail = error.Message
        };

        if (error.Details is not null)
            problem.Extensions["errors"] = error.Details;

        return new ObjectResult(problem) { StatusCode = statusCode };
    }
}
