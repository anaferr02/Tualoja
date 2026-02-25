export const API_BASE = "/api";

export function getToken() {
  return localStorage.getItem("tualoja_token");
}

export function setToken(token) {
  localStorage.setItem("tualoja_token", token);
}

export function clearToken() {
  localStorage.removeItem("tualoja_token");
}

export async function api(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error || "Error";
    throw new Error(msg);
  }
  return data;
}
