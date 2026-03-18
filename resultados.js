import { db } from "./firebase-config.js";
import {
  collection,
 getDocs
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const cont = document.getElementById("gridResultados");

async function cargarResultados() {
  try {
    const querySnapshot = await getDocs(collection(db, "alojamientos"));

    let html = "";

    if (querySnapshot.empty) {
      cont.innerHTML = `<p>No hay alojamientos publicados todavía.</p>`;
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const a = docSnap.data();
      const id = docSnap.id;

      html += `
        <div class="resultado-card">
          <img class="resultado-img" src="${a.fotos?.[0] || "https://via.placeholder.com/400x250?text=Sin+imagen"}" alt="${a.titulo || "Alojamiento"}">

          <div class="resultado-info">
            <h3 class="resultado-titulo">${a.titulo || "Sin título"}</h3>

            <div class="resultado-ubicacion">
              ${a.ciudad || "Sin ciudad"} - ${a.provincia || "Sin provincia"}
            </div>

            <div class="resultado-precio">
              $${a.precio || 0} <span>/ noche</span>
            </div>

            <div class="resultado-acciones">
              <a href="detalle.html?id=${id}">Ver alojamiento</a>
            </div>
          </div>
        </div>
      `;
    });

    cont.innerHTML = html;
  } catch (error) {
    console.error("Error al cargar resultados:", error);
    cont.innerHTML = `<p>Hubo un error al cargar los alojamientos.</p>`;
  }
}

cargarResultados();
