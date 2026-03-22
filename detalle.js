import { db, auth } from "./firebase-config.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const checkinParam = (params.get("checkin") || "").trim();
const checkoutParam = (params.get("checkout") || "").trim();
const guestsParam = (params.get("guests") || "1").trim();

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

function fechaToInputFormat(fecha) {
  const d = new Date(fecha);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
    reservas.push({ ...d.data(), _docId: d.id });
  });

  return reservas;
}

async function cargarDetalle() {
  try {
    if (!id) {
      noExiste.style.display = "block";
      return;
    }

    const docRef = doc(db, "alojamientos", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      noExiste.style.display = "block";
      return;
    }

    const alojamiento = docSnap.data();
    const alojamientoId = docSnap.id;

    const reservasAceptadas = await cargarReservasAceptadas(alojamientoId);

    const fechasOcupadas = [];

    reservasAceptadas.forEach((r) => {
      const inicio = new Date(r.checkin + "T00:00:00");
      const fin = new Date(r.checkout + "T00:00:00");

      for (let d = new Date(inicio); d < fin; d.setDate(d.getDate() + 1)) {
        fechasOcupadas.push(fechaToInputFormat(d));
      }
    });

    cont.innerHTML = `
      <div class="detalle-layout">

        <h1>${escapeHTML(alojamiento.titulo)}</h1>

        <p class="detalle-ubicacion-top">
          📍 <strong>${escapeHTML(alojamiento.ciudad)}, ${escapeHTML(alojamiento.provincia)}</strong>
        </p>

        <p class="detalle-subtexto">
          👥 ${escapeHTML(alojamiento.capacidad || "-")} huéspedes ·
          🛏️ ${escapeHTML(alojamiento.camas || "-")} camas ·
          🛁 ${escapeHTML(alojamiento.banos || "-")} baños
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
              <div class="detalle-item"><strong>Tipo:</strong> ${escapeHTML(alojamiento.tipo || "-")}</div>
              <div class="detalle-item"><strong>Servicios:</strong> ${escapeHTML((alojamiento.servicios || []).join(", ") || "-")}</div>
              <div class="detalle-item"><strong>Reglas:</strong> ${escapeHTML((alojamiento.reglas || []).join(", ") || "-")}</div>
              <div class="detalle-item"><strong>Check-in:</strong> ${escapeHTML(alojamiento.checkinDesde || "-")}</div>
              <div class="detalle-item"><strong>Check-out:</strong> ${escapeHTML(alojamiento.checkoutHasta || "-")}</div>
              <div class="detalle-item"><strong>Cancelación:</strong> ${escapeHTML(alojamiento.cancelacion || "-")}</div>
            </div>

            <div class="detalle-info-right">

              <div class="detalle-precio-box">
                <span class="detalle-precio-numero">$${escapeHTML(alojamiento.precio || 0)}</span>
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
                <input id="guestsInput" type="number" min="1" max="${escapeHTML(alojamiento.capacidad || 1)}" value="1" class="detalle-input">
              </div>

              <div id="ocupadasBox" class="detalle-total-box" style="background:#fff8e8;border-color:#f2ddb2;color:#7a5a00;">
                ${
                  reservasAceptadas.length
                    ? `Fechas ocupadas: ${reservasAceptadas.map(r => `${formatDate(r.checkin)} al ${formatDate(r.checkout)}`).join(" · ")}`
                    : "No hay fechas ocupadas actualmente."
                }
              </div>

              <div id="totalBox" class="detalle-total-box">
                Elegí fechas válidas para ver el total.
              </div>

              <button id="btnReservar" type="button" class="detalle-btn-reservar">
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

    const hoy = new Date().toISOString().split("T")[0];
    checkinInput.min = hoy;
    checkoutInput.min = hoy;

    function fechaBloqueada(fecha) {
      return fechasOcupadas.includes(fecha);
    }

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

      if (noches > Number(alojamiento.maxNoches || 30)) {
        totalBox.textContent = `La estadía supera el máximo permitido de ${Number(alojamiento.maxNoches || 30)} noches.`;
        return 0;
      }

      const total = Number(alojamiento.precio || 0) * noches;
      totalBox.textContent = `${noches} noche${noches > 1 ? "s" : ""} · Total estimado: $${total} ARS`;
      return total;
    }

    if (checkinParam) {
      checkinInput.value = checkinParam;
    }

    if (checkoutParam) {
      checkoutInput.value = checkoutParam;
    }

    if (guestsParam) {
      guestsInput.value = guestsParam;
    }

    if (checkinInput.value) {
      const minCheckout = new Date(checkinInput.value + "T00:00:00");
      minCheckout.setDate(minCheckout.getDate() + 1);
      checkoutInput.min = fechaToInputFormat(minCheckout);
    }

    checkinInput.addEventListener("change", () => {
      if (fechaBloqueada(checkinInput.value)) {
        alert("❌ Esa fecha está ocupada");
        checkinInput.value = "";
      }

      if (checkinInput.value) {
        const minCheckout = new Date(checkinInput.value + "T00:00:00");
        minCheckout.setDate(minCheckout.getDate() + 1);
        checkoutInput.min = fechaToInputFormat(minCheckout);
      } else {
        checkoutInput.min = hoy;
      }

      if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
        checkoutInput.value = "";
      }

      actualizarTotal();
    });

    checkoutInput.addEventListener("change", () => {
      if (fechaBloqueada(checkoutInput.value)) {
        alert("❌ Esa fecha está ocupada");
        checkoutInput.value = "";
      }

      actualizarTotal();
    });

    btnReservar.addEventListener("click", async () => {
      const usuario = auth.currentUser;

      if (!usuario) {
        localStorage.setItem("redirectAfterLogin", location.pathname + location.search);
        localStorage.setItem("pendingReservaCheckin", checkinInput.value || "");
        localStorage.setItem("pendingReservaCheckout", checkoutInput.value || "");
        localStorage.setItem("pendingReservaGuests", guestsInput.value || "1");
        location.href = "login.html";
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

      if (fechaBloqueada(checkin) || fechaBloqueada(checkout)) {
        msgReserva.textContent = "❌ Hay fechas ocupadas en tu selección.";
        return;
      }

      if (!fechasDisponibles(checkin, checkout)) {
        msgReserva.textContent = "❌ Esas fechas ya están ocupadas.";
        return;
      }

      if (noches > Number(alojamiento.maxNoches || 30)) {
        msgReserva.textContent = `❌ El máximo permitido es de ${Number(alojamiento.maxNoches || 30)} noches.`;
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

          listingId: alojamientoId,
          listingDocId: alojamientoId,
          listingPublicId: alojamiento.id || "",
          title: alojamiento.titulo || "",

          hostEmail: (alojamiento.anfitrionEmail || alojamiento.ownerEmail || "").toLowerCase(),
          hostId: alojamiento.anfitrionId || alojamiento.createdBy || "",
          anfitrionEmail: (alojamiento.anfitrionEmail || alojamiento.ownerEmail || "").toLowerCase(),
          anfitrionId: alojamiento.anfitrionId || alojamiento.createdBy || "",

          guestEmail: (usuario.email || "").toLowerCase(),
          guestName: usuario.displayName || "Huésped",
          guestId: usuario.uid,

          checkin,
          checkout,
          guests,
          total,
          status: "pendiente",
          createdAt: serverTimestamp(),
          createdBy: usuario.uid
        });

        msgReserva.textContent = "✅ Reserva enviada correctamente. El anfitrión la verá en su panel.";
      } catch (error) {
        console.error(error);
        msgReserva.textContent = "❌ No se pudo guardar la reserva.";
        btnReservar.disabled = false;
        btnReservar.classList.remove("disabled");
      }
    });

    const pendingCheckin = localStorage.getItem("pendingReservaCheckin");
    const pendingCheckout = localStorage.getItem("pendingReservaCheckout");
    const pendingGuests = localStorage.getItem("pendingReservaGuests");

    if (pendingCheckin) checkinInput.value = pendingCheckin;
    if (pendingCheckout) checkoutInput.value = pendingCheckout;
    if (pendingGuests) guestsInput.value = pendingGuests;

    localStorage.removeItem("pendingReservaCheckin");
    localStorage.removeItem("pendingReservaCheckout");
    localStorage.removeItem("pendingReservaGuests");

    if (checkinInput.value) {
      const minCheckout = new Date(checkinInput.value + "T00:00:00");
      minCheckout.setDate(minCheckout.getDate() + 1);
      checkoutInput.min = fechaToInputFormat(minCheckout);
    }

    actualizarTotal();

  } catch (error) {
    console.error(error);
    noExiste.style.display = "block";
  }
}

cargarDetalle();
