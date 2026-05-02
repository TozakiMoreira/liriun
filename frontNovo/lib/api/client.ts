import { env } from "@/lib/config/env";
import { useAuthStore } from "@/stores/auth";

import { ApiError } from "./error";
import type { ProblemDetails } from "./types";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined | null>;
  signal?: AbortSignal;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, signal } = opts;

  const url = new URL(path.replace(/^\//, ""), env.apiUrl + "/");
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    }
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = useAuthStore.getState().token;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (res.status === 401) {
    useAuthStore.getState().clear();
  }

  if (!res.ok) {
    let problem: ProblemDetails | undefined;
    try {
      const text = await res.text();
      if (text) problem = JSON.parse(text) as ProblemDetails;
    } catch {
      /* corpo não JSON */
    }
    throw new ApiError(
      problem?.detail ?? problem?.title ?? `HTTP ${res.status}`,
      res.status,
      problem,
    );
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export const api = {
  get: <T>(path: string, query?: RequestOptions["query"]) =>
    request<T>(path, { method: "GET", query }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body }),
  delete: <T = void>(path: string) => request<T>(path, { method: "DELETE" }),
};
