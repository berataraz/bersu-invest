"use client";

type ApiResponse<T> = { data: T; error?: never } | { data?: never; error: { message?: string } };

let csrfToken: string | undefined;

async function csrf(refresh = false) {
  if (refresh) csrfToken = undefined;
  if (csrfToken) return csrfToken;
  const response = await fetch("/api/v1/auth/csrf", { credentials: "same-origin", cache: "no-store" });
  csrfToken = response.headers.get("x-csrf-token") ?? undefined;
  if (!csrfToken) throw new Error("Güvenlik belirteci alınamadı. Sayfayı yenileyin.");
  return csrfToken;
}

export async function adminApi<T>(path: string, init: RequestInit = {}) {
  const isMutation = !["GET", "HEAD"].includes((init.method ?? "GET").toUpperCase());
  const send = async (refreshCsrf = false) => {
    const token = isMutation ? await csrf(refreshCsrf) : undefined;
    const headers = new Headers(init.headers);
    if (isMutation) headers.set("x-csrf-token", token!);
    if (init.body && !(init.body instanceof FormData)) headers.set("content-type", "application/json");
    return fetch(path, { ...init, headers, credentials: "same-origin" });
  };
  let response = await send();
  if (isMutation && response.status === 403) {
    const rejected = await response.clone().json().catch(() => null) as ApiResponse<unknown> | null;
    if (rejected && "error" in rejected && rejected.error?.message === "Invalid CSRF token.") response = await send(true);
  }
  if (response.status === 204) return undefined as T;
  const payload = await response.json() as ApiResponse<T>;
  if (!response.ok || "error" in payload) {
    const message = "error" in payload ? payload.error?.message : undefined;
    throw new Error(message || "İşlem tamamlanamadı.");
  }
  return payload.data;
}
