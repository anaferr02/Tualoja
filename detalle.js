import { db } from "./firebase-config.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const cont = document.getElementById("detalleWrap");
const noExiste = document.getElementById("noExiste");

async function cargarDetalle() {
  try {
    const querySnapshot = await getDocs(collection(db, "alojamientos"));

    let alojamiento = null;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (String(data.id) === String(id)) {
        alojamiento = data;
      }
    });

    if (!alojamiento) {
      noExiste.style.display = "block";
      return;
    }

    cont.innerHTML = `
      <div class="detalle-layout">

        <h1>${alojamiento.titulo}</h1>

        <p class="detalle-ubicacion-top">
          📍 <strong>${alojamiento.ciudad}, ${alojamiento.provincia}</strong>
        </p>

        <p class="detalle-subtexto">
          👥 ${alojamiento.capacidad} huéspedes · 🛏️ ${alojamiento.camas} camas · 🛁 ${alojamiento.banos} baños
        </p>

        <p class="detalle-descripcion-top">
          ${alojamiento.descripcion || ""}
        </p>

        <div class="detalle-card">

          <div class="detalle-galeria">
            ${
              alojamiento.fotos?.length
                ? `<img src="${alojamiento.fotos[0]}">`
                : `
                  <div class="detalle-galeria-empty">
                    <div class="icono">🏡</div>
                    <div class="texto">Sin fotos disponibles</div>
                  </div>
                `
            }
          </div>

          <div class="detalle-info-grid">

            <div class="detalle-info-left">
              <div class="detalle-item"><strong>Tipo:</strong> ${alojamiento.tipo}</div>
              <div class="detalle-item"><strong>Servicios:</strong> ${(alojamiento.servicios || []).join(", ") || "-"}</div>
              <div class="detalle-item"><strong>Reglas:</strong> ${(alojamiento.reglas || []).join(", ") || "-"}</div>
              <div class="detalle-item"><strong>Check-in:</strong> ${alojamiento.checkinDesde}</div>
              <div class="detalle-item"><strong>Check-out:</strong> ${alojamiento.checkoutHasta}</div>
              <div class="detalle-item"><strong>Cancelación:</strong> ${alojamiento.cancelacion}</div>
            </div>

            <div class="detalle-info-right">

              <div class="detalle-precio-box">
                <span class="detalle-precio-numero">$${alojamiento.precio}</span>
                <span class="detalle-precio-texto">/ noche</span>
              </div>

              <p class="detalle-minimo">
                Máx. ${alojamiento.maxNoches || 30} noches
              </p>

              <div class="detalle-reserva-form">
                <label class="detalle-label">Check-in</label>
                <input type="date" class="detalle-input">

                <label class="detalle-label">Check-out</label>
                <input type="date" class="detalle-input">
              </div>

              <div class="detalle-total-box">
                Total estimado: $${alojamiento.precio} ARS
              </div>

              <button class="detalle-btn-reservar">
                Reservar
              </button>

              <p class="detalle-ayuda">
                No se cobra nada ahora
              </p>

            </div>

          </div>
        </div>
      </div>
    `;

  } catch (error) {
    console.error(error);
    noExiste.style.display = "block";
  }
}

cargarDetalle();
