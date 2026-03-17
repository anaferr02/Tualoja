import { db } from "./firebase-config.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const cont = document.getElementById("gridResultados");

async function cargarResultados() {

  const querySnapshot = await getDocs(collection(db, "alojamientos"));

  let html = "";

  querySnapshot.forEach((doc) => {

    const a = doc.data();

    html += `
      <div class="resultado-card">

        <img class="resultado-img" src="${a.fotos?.[0] || ''}">

        <div class="resultado-info">
          <h3 class="resultado-titulo">${a.titulo}</h3>

          <div class="resultado-ubicacion">
            ${a.ciudad} - ${a.provincia}
          </div>

          <div class="resultado-precio">
            $${a.precio} <span>/ noche</span>
          </div>

          <div class="resultado-acciones">
            <a href="detalle.html?id=${a.id}">Ver alojamiento</a>
          </div>
        </div>

      </div>
    `;
  });

  cont.innerHTML = html;
}

cargarResultados();
