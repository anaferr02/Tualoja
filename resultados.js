import { db } from "./firebase-config.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const cont = document.getElementById("gridResultados");
const emptyResultados = document.getElementById("emptyResultados");

const params = new URLSearchParams(window.location.search);
const destino = (params.get("destino") || params.get("ubicacion") || params.get("q") || "").toLowerCase();
const checkin = params.get("checkin") || "";
const checkout = params.get("checkout") || "";
const guests = params.get("guests") || params.get("huespedes") || "1";

async function cargarResultados() {
  try {
    const querySnapshot = await getDocs(collection(db, "alojamientos"));

    let html = "";
    let encontrados = 0;

    querySnapshot.forEach((docSnap) => {
      const a = docSnap.data();

      const ciudad = (a.ciudad || "").toLowerCase();
      const provincia = (a.provincia || "").toLowerCase();
      const ubicacion = (a.ubicacion || "").toLowerCase();
      const titulo = (a.titulo || "").toLowerCase();

      const coincideDestino =
        !destino ||
        ciudad.includes(destino) ||
        provincia.includes(destino) ||
        ubicacion.includes(destino) ||
        titulo.includes(destino);

      if (!coincideDestino) return;

      encontrados++;

      const foto = a.fotos?.[0] || "";
      const precio = Number(a.precio || 0).toLocaleString("es-AR");

      html += `
        <div class="resultado-card">

          <img class="resultado-img" src="${foto}" alt="${a.titulo || "Alojamiento"}">

          <div class="resultado-info">
            <h3 class="resultado-titulo">${a.titulo || "Alojamiento sin título"}</h3>

            <div class="resultado-ubicacion">
              ${(a.ciudad || "")} ${(a.ciudad && a.provincia ? "-" : "")} ${(a.provincia || "")}
            </div>

            <div class="resultado-precio">
              $${precio} <span>/ noche</span>
            </div>

            <div class="resultado-acciones">
              <a href="detalle.html?id=${docSnap.id}&checkin=${encodeURIComponent(checkin)}&checkout=${encodeURIComponent(checkout)}&guests=${encodeURIComponent(guests)}&destino=${encodeURIComponent(destino)}">
                Ver alojamiento
              </a>
            </div>
          </div>

        </div>
      `;
    });

    cont.innerHTML = html;

    if (emptyResultados) {
      emptyResultados.style.display = encontrados === 0 ? "block" : "none";
    }

  } catch (error) {
    console.error("Error al cargar resultados:", error);
    cont.innerHTML = `<p class="empty-estado">Hubo un error al cargar los alojamientos.</p>`;
    if (emptyResultados) emptyResultados.style.display = "none";
  }
}

cargarResultados();
