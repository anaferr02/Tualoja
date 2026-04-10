import { auth } from "../../firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const USER_KEY = "tualoja_user";
const LOGGED_KEY = "tualoja_logged";
const googleProvider = new GoogleAuthProvider();

function saveUser(user) {
  const data = {
    id: user.uid,
    name: user.displayName || "",
    email: user.email || ""
  };

  localStorage.setItem(USER_KEY, JSON.stringify(data));
  localStorage.setItem(LOGGED_KEY, "1");

  return data;
}

function clearUser() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LOGGED_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function refreshMe() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(saveUser(user));
      } else {
        clearUser();
        resolve(null);
      }
      unsubscribe();
    });
  });
}

export async function register(name, email, password) {
  const cleanEmail = email.trim().toLowerCase();
  const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);

  if (name) {
    await updateProfile(cred.user, { displayName: name });
  }

  return saveUser(auth.currentUser || cred.user);
}

export async function login(email, password) {
  const cleanEmail = email.trim().toLowerCase();
  const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
  return saveUser(cred.user);
}

export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  return saveUser(cred.user);
}

export async function sendReset(email) {
  const cleanEmail = email.trim().toLowerCase();
  auth.languageCode = "es";

  await sendPasswordResetEmail(auth, cleanEmail, {
    url: "https://tualoja.com/login.html?reset=ok",
    handleCodeInApp: false
  });
}

export async function logout() {
  await signOut(auth);
  clearUser();
  location.href = "index.html";
}
