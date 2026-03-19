import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  const contenedor = document.querySelector("[data-mis-alojamientos]");
  const btnLogout = document.querySelector("[data-cerrar-sesion]");

  // Cerrar sesión
  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "login.html";
    });
  }

  // Ver usuario logueado
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("Iniciá sesión");
      window.location.href = "login.html";
      return;
    }

    cargarAlojamientos(user.uid);
  });

  async function cargarAlojamientos(uid) {
    if (!contenedor) return;

    contenedor.innerHTML = "Cargando...";

    try {
      const q = query(
        collection(db, "alojamientos"),
        where("anfitrionId", "==", uid)
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        contenedor.innerHTML = "<p>No tenés alojamientos todavía.</p>";
        return;
      }

      let html = "";

      snap.forEach((doc) => {
        const a = doc.data();

        html += `
          <div style="border:1px solid #ddd; padding:10px; margin-bottom:10px;">
            <h3>${a.titulo || "Sin título"}</h3>
            <p>${a.ciudad || ""} - ${a.provincia || ""}</p>
            <p>$${a.precio || "0"} / noche</p>
          </div>
        `;
      });

      contenedor.innerHTML = html;

    } catch (error) {
      console.error(error);
      contenedor.innerHTML = "Error al cargar alojamientos";
    }
  }

});
