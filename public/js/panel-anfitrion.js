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

  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      try {
        await signOut(auth);
        window.location.href = "login.html";
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
        alert("No se pudo cerrar sesión");
      }
    });
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("Iniciá sesión");
      window.location.href = "login.html";
      return;
    }

    await cargarAlojamientos(user.uid);
  });

  async function cargarAlojamientos(uid) {
    if (!contenedor) {
      console.error("No existe el contenedor data-mis-alojamientos en el HTML");
      return;
    }

    contenedor.innerHTML = "<p>Cargando alojamientos...</p>";

    try {
      const q = query(
        collection(db, "alojamientos"),
        where("anfitrionId", "==", uid)
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        contenedor.innerHTML = `
          <div class="vacio">
            <p>No tenés alojamientos todavía.</p>
          </div>
        `;
        return;
      }

      let html = "";

      snap.forEach((docSnap) => {
        const a = docSnap.data();

        html += `
          <div class="card-alojamiento">
            <img src="${a.fotos?.[0] || 'https://via.placeholder.com/800x300?text=Sin+foto'}" alt="${a.titulo || 'Alojamiento'}">
            <div class="card-info">
              <h3>${a.titulo || "Sin título"}</h3>
              <p>${a.ciudad || ""} - ${a.provincia || ""}</p>
              <p><strong>$${a.precio || 0}</strong> por noche</p>
              <a href="detalle.html?id=${docSnap.id}">Ver alojamiento</a>
            </div>
          </div>
        `;
      });

      contenedor.innerHTML = html;
    } catch (error) {
      console.error("Error al cargar alojamientos:", error);
      contenedor.innerHTML = "<p>Error al cargar alojamientos.</p>";
    }
  }
});
