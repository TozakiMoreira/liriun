import { HttpErrorResponse } from '@angular/common/http';

export interface ProblemDetailsResultado {
  errosCampo: Record<string, string>;
  mensagemGeral: string | null;
}

export function extrairProblemDetails(
  err: HttpErrorResponse,
  fallback: string,
): ProblemDetailsResultado {
  const body = err?.error;
  const errosCampo: Record<string, string> = {};

  if (body?.errors && typeof body.errors === 'object') {
    for (const [chave, mensagens] of Object.entries(body.errors)) {
      const campo = chave.toLowerCase();
      const msgs = Array.isArray(mensagens) ? mensagens : [String(mensagens)];
      if (msgs[0]) errosCampo[campo] = msgs[0];
    }
  }

  if (Object.keys(errosCampo).length > 0) {
    return { errosCampo, mensagemGeral: null };
  }

  if (body?.detail) {
    return { errosCampo, mensagemGeral: body.detail };
  }

  if (err.status === 0) {
    return { errosCampo, mensagemGeral: 'Sem conexão com o servidor. Tenta de novo em instantes.' };
  }

  return { errosCampo, mensagemGeral: fallback };
}
