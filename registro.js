import { auth } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const form = document.getElementById("registroForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const datos = Object.fromEntries(formData.entries());

  const nombre = datos.nombre || "";
  const email = datos.email || "";
  const password = datos.password || "";

  if (!email || !password) {
    alert("Completá email y contraseña.");
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    if (nombre) {
      await updateProfile(cred.user, {
        displayName: nombre
      });
    }

    alert("Cuenta creada con éxito 🚀");
    location.href = "panel-anfitrion.html";

  } catch (error) {
    console.error(error);
    alert("Error al registrarse.");
  }
});
