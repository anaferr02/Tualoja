import { db } from "./firebase-config.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const grid = document.getElementById("gridResultados");
const empty = document.getElementById("emptyResultados");

const params = new URLSearchParams(window.location.search);
const destino = (params.get("destino") || "").toLowerCase();

async function cargarAlojamientos() {
  try {
    const querySnapshot = await getDocs(collection(db, "alojamientos"));

    let alojamientos = [];

    querySnapshot.forEach((doc) => {
      alojamientos.push(doc.data());
    });

    // 🔎 FILTRO POR CIUDAD / PROVINCIA
    if (destino) {
      alojamientos = alojamientos.filter(a =>
        (a.ciudad || "").toLowerCase().includes(destino) ||
        (a.provincia || "").toLowerCase().includes(destino)
      );
    }

    if (!alojamientos.length) {
      empty.style.display = "block";
      return;
    }

    grid.innerHTML = alojamientos.map(a => `
      <div class="resultado-card">

        <img class="resultado-img" src="${a.fotos?.[0] || 'https://via.placeholder.com/400'}">

        <div class="resultado-info">
          <h3 class="resultado-titulo">${a.titulo}</h3>

          <div class="resultado-ubicacion">
            📍 ${a.ciudad}, ${a.provincia}
          </div>

          <div class="resultado-meta">
            👥 ${a.capacidad} huéspedes · 🛏️ ${a.camas} camas
          </div>

          <div class="resultado-precio">
            $${a.precio} <span>/ noche</span>
          </div>

          <div class="resultado-acciones">
            <a href="detalle.html?id=${a.id}">Ver alojamiento</a>
          </div>
        </div>

      </div>
    `).join("");

    cargarMapa(alojamientos);

  } catch (error) {
    console.error(error);
    empty.style.display = "block";
  }
}

function cargarMapa(alojamientos) {
  const mapaDiv = document.getElementById("mapa");

  if (!mapaDiv) return;

  mapaDiv.style.height = "400px";
  mapaDiv.style.marginBottom = "20px";
  mapaDiv.style.borderRadius = "16px";

  const map = L.map("mapa").setView([-34.6, -58.4], 4);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

  alojamientos.forEach(a => {
    if (a.lat && a.lng) {
      L.marker([a.lat, a.lng])
        .addTo(map)
        .bindPopup(`<b>${a.titulo}</b><br>${a.ciudad}`);
    }
  });
}

cargarAlojamientos();
