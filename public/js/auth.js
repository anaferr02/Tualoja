// public/js/auth.js
const USERS_KEY = "tualoja_users";
const USER_KEY = "tualoja_user";
const LOGGED_KEY = "tualoja_logged";

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function refreshMe() {
  const logged = localStorage.getItem(LOGGED_KEY) === "1";
  if (!logged) return null;

  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function register(name, email, password) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!name || !cleanEmail || !password) throw new Error("Completá nombre, email y contraseña.");

  const users = loadUsers();
  const exists = users.some(u => u.email === cleanEmail);
  if (exists) throw new Error("Ese email ya está registrado.");

  const user = { id: crypto.randomUUID?.() || String(Date.now()), name, email: cleanEmail, password };
  users.push(user);
  saveUsers(users);

  localStorage.setItem(USER_KEY, JSON.stringify({ id: user.id, name: user.name, email: user.email }));
  localStorage.setItem(LOGGED_KEY, "1");
  return { id: user.id, name: user.name, email: user.email };
}

export async function login(email, password) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const users = loadUsers();

  const user = users.find(u => u.email === cleanEmail && u.password === password);
  if (!user) throw new Error("Email o contraseña incorrectos.");

  localStorage.setItem(USER_KEY, JSON.stringify({ id: user.id, name: user.name, email: user.email }));
  localStorage.setItem(LOGGED_KEY, "1");
  return { id: user.id, name: user.name, email: user.email };
}

export function logout() {
  localStorage.removeItem(LOGGED_KEY);
  localStorage.removeItem(USER_KEY);
  location.href = "index.html";
}
