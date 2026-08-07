"use client";

type ApiResponse<T> = { data: T; error?: never } | { data?: never; error: { message?: string } };

let csrfToken: string | undefined;

async function csrf() {
  if (csrfToken) return csrfToken;
  const response = await fetch("/api/v1/auth/csrf", { credentials: "same-origin", cache: "no-store" });
  csrfToken = response.headers.get("x-csrf-token") ?? undefined;
  if (!csrfToken) throw new Error("Güvenlik belirteci alınamadı. Sayfayı yenileyin.");
  return csrfToken;
}

export async function adminApi<T>(path: string, init: RequestInit = {}) {
  const isMutation = !["GET", "HEAD"].includes((init.method ?? "GET").toUpperCase());
  const token = isMutation ? await csrf() : undefined;
  const headers = new Headers(init.headers);
  if (isMutation) headers.set("x-csrf-token", token!);
  if (init.body && !(init.body instanceof FormData)) headers.set("content-type", "application/json");
  const response = await fetch(path, { ...init, headers, credentials: "same-origin" });
  if (response.status === 204) return undefined as T;
  const payload = await response.json() as ApiResponse<T>;
  if (!response.ok || "error" in payload) {
    const message = "error" in payload ? payload.error?.message : undefined;
    throw new Error(message || "İşlem tamamlanamadı.");
  }
  return payload.data;
}
