/**
 * Backend retorna ProblemDetails (RFC 7807) em falhas:
 *   { type, title, status, detail, errors? }
 * Validation errors trazem `errors` como mapa { campo: string[] }.
 */
export function extractErrorMessage(err: unknown, fallback: string): string {
  if (!err || typeof err !== 'object' || !('error' in err)) {
    return fallback;
  }

  const body = (err as { error?: unknown }).error;
  if (!body || typeof body !== 'object') {
    return fallback;
  }

  const problem = body as {
    detail?: unknown;
    title?: unknown;
    errors?: Record<string, unknown>;
  };

  if (typeof problem.detail === 'string' && problem.detail.trim()) {
    return problem.detail;
  }

  if (problem.errors && typeof problem.errors === 'object') {
    for (const value of Object.values(problem.errors)) {
      if (Array.isArray(value) && typeof value[0] === 'string') {
        return value[0];
      }
    }
  }

  if (typeof problem.title === 'string' && problem.title.trim()) {
    return problem.title;
  }

  return fallback;
}
