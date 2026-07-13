/**
 * Helper de fetch hacia la API del club.
 *
 * Usa `NEXT_PUBLIC_API_URL` y envía cookies (`credentials: "include"`) para que
 * funcione la sesión basada en cookies httpOnly cuando la API esté levantada.
 *
 * NOTA: las páginas públicas y el dashboard de demo NO usan este helper todavía;
 * renderizan con datos mock embebidos para que el preview funcione sin backend.
 * Este helper queda listo para conectar las vistas reales cuando exista la API.
 */
// En producción (Netlify) por defecto "" → mismo origen, atendido por el
// rewrite de next.config.ts que proxya hacia la API. En desarrollo, directo
// a la API local. NEXT_PUBLIC_API_URL permite forzar otra URL si hace falta.
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:4000");

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const isJson = res.headers
    .get("content-type")
    ?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message =
      (data as { message?: string } | null)?.message ??
      `Error ${res.status} al llamar a ${path}`;
    throw new ApiError(res.status, message, data);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  put: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
