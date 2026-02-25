import { api, setToken, clearToken } from "./api.js";

export async function refreshMe() {
  const token = localStorage.getItem("tualoja_token");
  if (!token) return null;
  try {
    const { user, token: newToken } = await api("/me");
    if (newToken) setToken(newToken);
    localStorage.setItem("tualoja_user", JSON.stringify(user));
    return user;
  } catch {
    clearToken();
    localStorage.removeItem("tualoja_user");
    return null;
  }
}

export function getUser() {
  const raw = localStorage.getItem("tualoja_user");
  return raw ? JSON.parse(raw) : null;
}

export async function login(email, password) {
  const { token, user } = await api("/auth/login", { method: "POST", body: { email, password } });
  setToken(token);
  localStorage.setItem("tualoja_user", JSON.stringify(user));
  return user;
}

export async function register(name, email, password) {
  const { token, user } = await api("/auth/register", { method: "POST", body: { name, email, password } });
  setToken(token);
  localStorage.setItem("tualoja_user", JSON.stringify(user));
  return user;
}

export function logout() {
  clearToken();
  localStorage.removeItem("tualoja_user");
  location.href = "index.html";
}
