// public/js/auth.js
import { auth } from "../../firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const USER_KEY = "tualoja_user";
const LOGGED_KEY = "tualoja_logged";

function saveLocalUser(user) {
  if (!user) {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LOGGED_KEY);
    return null;
  }

  const data = {
    id: user.uid,
    name: user.displayName || "",
    email: user.email || ""
  };

  localStorage.setItem(USER_KEY, JSON.stringify(data));
  localStorage.setItem(LOGGED_KEY, "1");
  return data;
}

export async function refreshMe() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      if (!user) {
        saveLocalUser(null);
        resolve(null);
        return;
      }
      resolve(saveLocalUser(user));
    });
  });
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function register(name, email, password) {
  const cleanName = String(name || "").trim();
  const cleanEmail = String(email || "").trim().toLowerCase();

  if (!cleanName || !cleanEmail || !password) {
    throw new Error("Completá nombre, email y contraseña.");
  }

  const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);

  if (cleanName) {
    await updateProfile(cred.user, { displayName: cleanName });
  }

  return saveLocalUser({
    ...cred.user,
    displayName: cleanName
  });
}

export async function login(email, password) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
  return saveLocalUser(cred.user);
}

export async function sendReset(email) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail) throw new Error("Ingresá tu email.");

  auth.languageCode = "es";
  await sendPasswordResetEmail(auth, cleanEmail);
  return true;
}

export async function logout() {
  await signOut(auth);
  saveLocalUser(null);
  location.href = "index.html";
}
