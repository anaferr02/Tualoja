import { db } from "./firebase-config.js";
import { getUser } from "./public/js/auth.js";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const cont = document.getElementById("detalleWrap");
const noExiste = document.getElementById("noExiste");

function escapeHTML(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function nochesEntre(checkin, checkout) {
  if (!checkin || !checkout) return 0;
  const d1 = new Date(checkin + "T00:00:00");
  const d2 = new Date(checkout + "T00:00:00");
  const diff = d2 - d1;
  const noches = diff / (1000 * 60 * 60 * 24);
  return noches > 0 ? noches : 0;
}

function generarCodigoReserva() {
  return "RES-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function formatDate(fecha) {
  if (!fecha) return "-";
  const d = new Date(fecha + "T00:00:00");
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString("es-AR");
}

function rangosSePisan(aInicio, aFin, bInicio, bFin) {
  return aInicio < bFin && aFin > bInicio;
}

async function cargarReservasAceptadas(listingId) {
  const q = query(
    collection(db, "reservas"),
    where("listingId", "==", listingId),
    where("status", "==", "aceptada")
  );

  const snap = await getDocs(q);
  const reservas = [];

  snap.forEach((d) => {
    reservas.push(d.data());
  });

  return reservas;
}

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

    const reservasAceptadas = await cargarReservasAceptadas(alojamiento.id);

    cont.innerHTML = `
      <div class="detalle-layout">

        <h1>${escapeHTML(alojamiento.titulo)}</h1>

        <p class="detalle-ubicacion-top">
          📍 <strong>${escapeHTML(alojamiento.ciudad)}, ${escapeHTML(alojamiento.provincia)}</strong>
        </p>

        <p class="detalle-subtexto">
          👥 ${escapeHTML(alojamiento.capacidad)} huéspedes ·
          🛏️ ${escapeHTML(alojamiento.camas)} camas ·
          🛁 ${escapeHTML(alojamiento.banos)} baños
        </p>

        <p class="detalle-descripcion-top">
          ${escapeHTML(alojamiento.descripcion || "")}
        </p>

        <div class="detalle-card">

          <div class="detalle-galeria">
            ${
              alojamiento.fotos?.length
                ? `<img src="${alojamiento.fotos[0]}" alt="${escapeHTML(alojamiento.titulo)}">`
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
              <div class="detalle-item"><strong>Tipo:</strong> ${escapeHTML(alojamiento.tipo)}</div>
              <div class="detalle-item"><strong>Servicios:</strong> ${escapeHTML((alojamiento.servicios || []).join(", ") || "-")}</div>
              <div class="detalle-item"><strong>Reglas:</strong> ${escapeHTML((alojamiento.reglas || []).join(", ") || "-")}</div>
              <div class="detalle-item"><strong>Check-in:</strong> ${escapeHTML(alojamiento.checkinDesde)}</div>
              <div class="detalle-item"><strong>Check-out:</strong> ${escapeHTML(alojamiento.checkoutHasta)}</div>
              <div class="detalle-item"><strong>Cancelación:</strong> ${escapeHTML(alojamiento.cancelacion)}</div>
            </div>

            <div class="detalle-info-right">

              <div class="detalle-precio-box">
                <span class="detalle-precio-numero">$${escapeHTML(alojamiento.precio)}</span>
                <span class="detalle-precio-texto">/ noche</span>
              </div>

              <p class="detalle-minimo">
                Máx. ${escapeHTML(alojamiento.maxNoches || 30)} noches
              </p>

              <div class="detalle-reserva-form">
                <label class="detalle-label">Check-in</label>
                <input id="checkinInput" type="date" class="detalle-input">

                <label class="detalle-label">Check-out</label>
                <input id="checkoutInput" type="date" class="detalle-input">

                <label class="detalle-label">Huéspedes</label>
                <input id="guestsInput" type="number" min="1" max="${escapeHTML(alojamiento.capacidad)}" value="1" class="detalle-input">
              </div>

              <div id="ocupadasBox" class="detalle-total-box" style="background:#fff8e8;border-color:#f2ddb2;color:#7a5a00;">
                ${
                  reservasAceptadas.length
                    ? `Fechas ocupadas: ${reservasAceptadas.map(r => `${formatDate(r.checkin)} al ${formatDate(r.checkout)}`).join(" · ")}`
                    : "No hay fechas ocupadas actualmente."
                }
              </div>

              <div id="totalBox" class="detalle-total-box">
                Elegí fechas para ver el total.
              </div>

              <button id="btnReservar" class="detalle-btn-reservar">
                Reservar
              </button>

              <p id="msgReserva" class="detalle-ayuda">
                No se cobra nada ahora
              </p>

            </div>

          </div>
        </div>
      </div>
    `;

    const checkinInput = document.getElementById("checkinInput");
    const checkoutInput = document.getElementById("checkoutInput");
    const guestsInput = document.getElementById("guestsInput");
    const totalBox = document.getElementById("totalBox");
    const btnReservar = document.getElementById("btnReservar");
    const msgReserva = document.getElementById("msgReserva");

    function fechasDisponibles(checkin, checkout) {
      if (!checkin || !checkout) return true;

      const inicio = new Date(checkin + "T00:00:00");
      const fin = new Date(checkout + "T00:00:00");

      return !reservasAceptadas.some((r) => {
        const rInicio = new Date(r.checkin + "T00:00:00");
        const rFin = new Date(r.checkout + "T00:00:00");
        return rangosSePisan(inicio, fin, rInicio, rFin);
      });
    }

    function actualizarTotal() {
      const checkin = checkinInput.value;
      const checkout = checkoutInput.value;
      const noches = nochesEntre(checkin, checkout);

      if (!checkin || !checkout || noches <= 0) {
        totalBox.textContent = "Elegí fechas válidas para ver el total.";
        return 0;
      }

      if (!fechasDisponibles(checkin, checkout)) {
        totalBox.textContent = "Esas fechas se cruzan con una reserva ya aceptada.";
        return 0;
      }

      const total = Number(alojamiento.precio || 0) * noches;
      totalBox.textContent = `${noches} noche${noches > 1 ? "s" : ""} · Total estimado: $${total} ARS`;
      return total;
    }

    checkinInput.addEventListener("change", actualizarTotal);
    checkoutInput.addEventListener("change", actualizarTotal);

    btnReservar.addEventListener("click", async () => {
      const me = getUser();

      if (!me) {
        location.href = "login.html?next=" + encodeURIComponent(location.pathname + location.search);
        return;
      }

      const checkin = checkinInput.value;
      const checkout = checkoutInput.value;
      const guests = Number(guestsInput.value || 1);
      const noches = nochesEntre(checkin, checkout);

      if (!checkin || !checkout || noches <= 0) {
        msgReserva.textContent = "Elegí fechas válidas.";
        return;
      }

      if (!fechasDisponibles(checkin, checkout)) {
        msgReserva.textContent = "❌ Esas fechas ya están ocupadas.";
        return;
      }

      if (guests < 1 || guests > Number(alojamiento.capacidad || 1)) {
        msgReserva.textContent = "La cantidad de huéspedes no es válida.";
        return;
      }

      const total = Number(alojamiento.precio || 0) * noches;

      btnReservar.disabled = true;
      btnReservar.classList.add("disabled");
      msgReserva.textContent = "Guardando reserva...";

      try {
        await addDoc(collection(db, "reservas"), {
          code: generarCodigoReserva(),
          listingId: alojamiento.id,
          title: alojamiento.titulo,
          hostEmail: alojamiento.ownerEmail || alojamiento.email || "",
          guestEmail: me.email || "",
          guestName: me.name || "Huésped",
          checkin,
          checkout,
          guests,
          total,
          status: "pendiente",
          createdAt: serverTimestamp()
        });

        msgReserva.textContent = "✅ Reserva enviada correctamente. El anfitrión la verá en su panel.";
      } catch (error) {
        console.error(error);
        msgReserva.textContent = "❌ No se pudo guardar la reserva.";
        btnReservar.disabled = false;
        btnReservar.classList.remove("disabled");
      }
    });

  } catch (error) {
    console.error(error);
    noExiste.style.display = "block";
  }
}

cargarDetalle();
