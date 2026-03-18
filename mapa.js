import { db } from "./firebase-config.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const mapaEl = document.getElementById("mapa");

if (mapaEl) {
  const mapa = L.map("mapa").setView([-34.6, -58.4], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(mapa);

  async function cargarMapa() {
    try {
      const snap = await getDocs(collection(db, "alojamientos"));

      snap.forEach((docSnap) => {
        const a = docSnap.data();
        const id = docSnap.id;

        if (!a.lat || !a.lng) return;

        L.marker([a.lat, a.lng])
          .addTo(mapa)
          .bindPopup(`
            <b>${a.titulo || "Alojamiento"}</b><br>
            ${a.ciudad || ""}<br>
            $${a.precio || 0}<br>
            <a href="detalle.html?id=${id}">Ver alojamiento</a>
          `);
      });
    } catch (error) {
      console.error("Error al cargar mapa:", error);
    }
  }

  cargarMapa();
}
