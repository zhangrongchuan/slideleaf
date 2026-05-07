export const API_URL = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000");

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = init.method || "GET";
  const startedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
  const headers = new Headers(init.headers);
  const body = init.body;
  if (body && !(body instanceof FormData) && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: "include"
  });
  const elapsedMs = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - startedAt);
  const logLabel = `[api] ${method} ${path} ${response.status} ${elapsedMs}ms`;

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    const responseText = await response.text();
    try {
      const data = JSON.parse(responseText) as { message?: string | string[] };
      if (Array.isArray(data.message)) message = data.message.join(", ");
      else if (data.message) message = data.message;
    } catch {
      message = responseText || message;
    }
    console.warn(logLabel, message);
    throw new Error(message);
  }

  console.info(logLabel);
  return response.json() as Promise<T>;
}

function normalizeApiUrl(input: string): string {
  const value = input.trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(value)) return value;
  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(value)) return `http://${value}`;
  return `https://${value}`;
}
