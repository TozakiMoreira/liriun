import type { ProblemDetails } from "./types";

export class ApiError extends Error {
  status: number;
  problem?: ProblemDetails;

  constructor(message: string, status: number, problem?: ProblemDetails) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.problem = problem;
  }
}

/** Extrai a mensagem mais útil de uma falha de API, com fallback. */
export function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const p = err.problem;
    if (p?.detail?.trim()) return p.detail;
    if (p?.errors) {
      for (const arr of Object.values(p.errors)) {
        if (Array.isArray(arr) && typeof arr[0] === "string") return arr[0];
      }
    }
    if (p?.title?.trim()) return p.title;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
