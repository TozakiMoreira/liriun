/**
 * Fetch wrapper para o backend .NET.
 *
 * Lê API_BASE_URL de env público (NEXT_PUBLIC_API_BASE_URL) e injeta JWT do
 * cookie/localStorage automaticamente em chamadas autenticadas.
 *
 * Em prod, JWT mora em cookie httpOnly setado pelo backend (mais seguro).
 * Em dev local, fallback pra localStorage `liriun.jwt` quando o backend
 * retornar token no body do login.
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

const TOKEN_KEY = "liriun.jwt";

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL não definida. Setar em .env.local (ex: http://localhost:5000)",
    );
  }
  return url.replace(/\/$/, "");
}

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function writeToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function api<T = unknown>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { body, auth = true, headers, ...rest } = opts;

  const finalHeaders = new Headers(headers);
  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = readToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...rest,
    headers: finalHeaders,
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
    credentials: "include",
  });

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    // Backend .NET responde ProblemDetails RFC 7807: { type, title, status, detail, errors }.
    // Mantém fallback pra code/message caso algum endpoint use o formato antigo.
    let payload:
      | { code?: string; message?: string; title?: string; detail?: string; details?: unknown; errors?: unknown }
      | null = null;
    try {
      payload = await res.json();
    } catch {
      // ignore parse error
    }
    throw new ApiError(
      res.status,
      payload?.code ?? payload?.title ?? `http_${res.status}`,
      payload?.message ?? payload?.detail ?? res.statusText ?? "Erro inesperado",
      payload?.details ?? payload?.errors,
    );
  }

  // 204 ou body vazio
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
