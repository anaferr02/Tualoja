import { db } from "./firebase-config.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const cont = document.getElementById("gridResultados");

function getBusqueda() {
  const params = new URLSearchParams(window.location.search);

  return {
    destino: params.get("destino") || "",
    checkin: params.get("checkin") || "",
    checkout: params.get("checkout") || "",
    huespedes: params.get("huespedes") || "1"
  };
}

async function cargarResultados() {
  const { checkin, checkout, huespedes } = getBusqueda();

  const querySnapshot = await getDocs(collection(db, "alojamientos"));
  let html = "";

  querySnapshot.forEach((docSnap) => {
    const a = docSnap.data();
    const docId = docSnap.id;

    const linkDetalle =
      `detalle.html?id=${encodeURIComponent(docId)}` +
      `&checkin=${encodeURIComponent(checkin)}` +
      `&checkout=${encodeURIComponent(checkout)}` +
      `&huespedes=${encodeURIComponent(huespedes)}`;

    html += `
      <div class="resultado-card">
        <img class="resultado-img" src="${a.fotos?.[0] || ""}" alt="${a.titulo || "Alojamiento"}">

        <div class="resultado-info">
          <h3 class="resultado-titulo">${a.titulo || "Sin título"}</h3>

          <div class="resultado-ubicacion">
            ${a.ciudad || ""} - ${a.provincia || ""}
          </div>

          <div class="resultado-precio">
            $${a.precio || 0} <span>/ noche</span>
          </div>

          <div class="resultado-acciones">
            <a href="${linkDetalle}">Ver alojamiento</a>
          </div>
        </div>
      </div>
    `;
  });

  cont.innerHTML = html;
}

cargarResultados();
