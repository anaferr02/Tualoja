import { db } from "./firebase-config.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const cont = document.getElementById("detalleAlojamiento");

// Obtener ID desde la URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function cargarDetalle() {

  if (!id) {
    cont.innerHTML = "<p>Alojamiento no encontrado</p>";
    return;
  }

  try {
    const ref = doc(db, "alojamientos", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      cont.innerHTML = "<p>No existe este alojamiento</p>";
      return;
    }

    const a = snap.data();

    cont.innerHTML = `
      <div class="detalle-card">

        <img class="detalle-img" src="${a.fotos?.[0] || ''}">

        <h2>${a.titulo}</h2>

        <p>${a.descripcion || ""}</p>

        <div><strong>Ubicación:</strong> ${a.ciudad} - ${a.provincia}</div>

        <div><strong>Precio:</strong> $${a.precio} por noche</div>

        <button id="btnReservar">Reservar</button>

      </div>
    `;

  } catch (error) {
    console.error(error);
    cont.innerHTML = "<p>Error al cargar</p>";
  }
}

cargarDetalle();
