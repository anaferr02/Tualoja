// detalle.js
import { getAlojamientoById } from "./storage.js";

function getId() {
  const u = new URL(window.location.href);
  return u.searchParams.get("id");
}

function moneyARS(n) {
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0
    }).format(Number(n) || 0);
  } catch {
    return `$${Number(n) || 0}`;
  }
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function crearCodigoReserva() {
  return "R" + Math.floor(100000 + Math.random() * 900000);
}

function getReservas() {
  try {
    return JSON.parse(localStorage.getItem("tualoja_bookings") || "[]");
  } catch {
    return [];
  }
}

function calcularNoches(inicio, fin) {
  const d1 = new Date(inicio + "T00:00:00");
  const d2 = new Date(fin + "T00:00:00");
  const diff = d2 - d1;
  const noches = diff / (1000 * 60 * 60 * 24);
  return noches > 0 ? noches : 0;
}

function hoyISO() {
  const hoy = new Date();
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, "0");
  const d = String(hoy.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

(function init() {
  const id = getId();
  const a = getAlojamientoById(id);

  const wrap = document.getElementById("detalleWrap");
  const noExiste = document.getElementById("noExiste");

  if (!wrap) return;

  if (!a) {
    if (noExiste) noExiste.style.display = "block";
    wrap.innerHTML = "";
    return;
  }

  const user = JSON.parse(localStorage.getItem("tualoja_user") || "{}");
  const myEmail = String(user.email || "").toLowerCase();

  const reservas = getReservas();

  const miReservaActiva = reservas.find((r) => {
    const reservaEmail = String(r.userEmail || r.guestEmail || "").toLowerCase();
    const mismoAlojamiento = String(r.listingId) === String(a.id);
    const activa = r.status !== "cancelada" && r.status !== "rechazada";
    return reservaEmail === myEmail && mismoAlojamiento && activa;
  });

  const servicios = Array.isArray(a.servicios) && a.servicios.length
    ? a.servicios.join(" · ")
    : "No especificados";

  const ubicacion = `${esc(a.ciudad || "")}${a.provincia ? `, <strong>${esc(a.provincia)}</strong>` : ""}${a.zona ? ` • ${esc(a.zona)}` : ""}`;
  const descripcion = esc(a.descripcion || "Este alojamiento no tiene descripción todavía.");
  const tipo = esc(a.tipo || "Alojamiento");
  const capacidad = Number(a.capacidad || 1);
  const minimoNoches = Number(a.minimoNoches || 1);
  const portada = Array.isArray(a.fotos) && a.fotos.length ? String(a.fotos[0]) : "";
  const precioPorNoche = Number(a.precio || 0);

  const galeriaHTML = portada
    ? `
      <div class="detalle-galeria">
        <img src="${esc(portada)}" alt="Foto de ${esc(a.titulo)}">
      </div>
    `
    : `
      <div class="detalle-galeria">
        <div class="detalle-galeria-empty">
          <div class="icono">📷</div>
          <div class="texto">Este alojamiento no cargó fotos todavía.</div>
        </div>
      </div>
    `;

  const reservaBoxHTML = miReservaActiva
    ? `
      <button class="detalle-btn-reservar disabled" type="button" disabled>
        Ya reservado
      </button>
    `
    : `
      <div class="detalle-reserva-form">
        <label class="detalle-label" for="checkin">Check-in</label>
        <input class="detalle-input" type="date" id="checkin" min="${hoyISO()}">

        <label class="detalle-label" for="checkout">Check-out</label>
        <input class="detalle-input" type="date" id="checkout" min="${hoyISO()}">

        <label class="detalle-label" for="guests">Huéspedes</label>
        <input class="detalle-input" type="number" id="guests" min="1" max="${capacidad}" value="1">

        <div class="detalle-total-box" id="detalleTotalBox">
          Total estimado: <strong id="detalleTotal">${moneyARS(precioPorNoche)}</strong>
        </div>

        <button class="detalle-btn-reservar" id="btnReservar" type="button">
          Reservar
        </button>
      </div>
    `;

  const ayudaHTML = miReservaActiva
    ? `Ya tenés una reserva para este alojamiento.`
    : `Elegí tus fechas y la cantidad de huéspedes para reservar.`;

  wrap.innerHTML = `
    <section class="detalle-layout">
      <h1>${esc(a.titulo)}</h1>

      <p class="detalle-ubicacion-top">📍 ${ubicacion}</p>

      ${!portada ? `<p class="detalle-subtexto">Este alojamiento no cargó fotos todavía.</p>` : ""}

      <p class="detalle-descripcion-top">${descripcion}</p>

      <div class="detalle-card">
        ${galeriaHTML}

        <div class="detalle-info-grid">
          <div class="detalle-info-left">
            <div class="detalle-item">🏠 <strong>Tipo:</strong> ${tipo}</div>
            <div class="detalle-item">👥 <strong>Capacidad:</strong> ${capacidad} personas</div>
            <div class="detalle-item">✅ <strong>Servicios:</strong> ${esc(servicios)}</div>
          </div>

          <div class="detalle-info-right">
            <div class="detalle-precio-box">
              <span class="detalle-precio-numero">${moneyARS(precioPorNoche)}</span>
              <span class="detalle-precio-texto">por noche</span>
            </div>

            <p class="detalle-minimo">📅 Mínimo de noches: ${minimoNoches}</p>

            ${reservaBoxHTML}

            <div class="detalle-ayuda">
              ${ayudaHTML}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  const btnReservar = document.getElementById("btnReservar");
  const checkinEl = document.getElementById("checkin");
  const checkoutEl = document.getElementById("checkout");
  const guestsEl = document.getElementById("guests");
  const detalleTotalEl = document.getElementById("detalleTotal");

  function actualizarTotal() {
    if (!detalleTotalEl || !checkinEl || !checkoutEl) return;

    const checkin = checkinEl.value;
    const checkout = checkoutEl.value;
    const noches = calcularNoches(checkin, checkout);

    if (!checkin || !checkout || noches <= 0) {
      detalleTotalEl.textContent = moneyARS(precioPorNoche);
      return;
    }

    const total = noches * precioPorNoche;
    detalleTotalEl.textContent = `${moneyARS(total)} (${noches} noche${noches > 1 ? "s" : ""})`;
  }

  if (checkinEl) {
    checkinEl.addEventListener("change", () => {
      if (checkoutEl && checkinEl.value && checkoutEl.value && checkoutEl.value <= checkinEl.value) {
        checkoutEl.value = "";
      }
      if (checkoutEl && checkinEl.value) {
        checkoutEl.min = checkinEl.value;
      }
      actualizarTotal();
    });
  }

  if (checkoutEl) {
    checkoutEl.addEventListener("change", actualizarTotal);
  }

  if (guestsEl) {
    guestsEl.addEventListener("change", () => {
      const v = Number(guestsEl.value || 1);
      if (v < 1) guestsEl.value = "1";
      if (v > capacidad) guestsEl.value = String(capacidad);
    });
  }

  if (!btnReservar) return;

  btnReservar.addEventListener("click", () => {
    if (localStorage.getItem("tualoja_logged") !== "1") {
      alert("Tenés que iniciar sesión para reservar.");
      location.href = "login.html?next=" + encodeURIComponent(window.location.pathname + window.location.search);
      return;
    }

    const userActual = JSON.parse(localStorage.getItem("tualoja_user") || "{}");
    const reservasActuales = getReservas();

    const yaExiste = reservasActuales.find((r) => {
      const reservaEmail = String(r.userEmail || r.guestEmail || "").toLowerCase();
      const mismoAlojamiento = String(r.listingId) === String(a.id);
      const activa = r.status !== "cancelada" && r.status !== "rechazada";
      return reservaEmail === String(userActual.email || "").toLowerCase() && mismoAlojamiento && activa;
    });

    if (yaExiste) {
      alert("Ya tenés una reserva para este alojamiento.");
      location.reload();
      return;
    }

    const checkin = checkinEl ? checkinEl.value : "";
    const checkout = checkoutEl ? checkoutEl.value : "";
    const guests = guestsEl ? Number(guestsEl.value || 1) : 1;

    if (!checkin || !checkout) {
      alert("Elegí check-in y check-out.");
      return;
    }

    const noches = calcularNoches(checkin, checkout);

    if (noches <= 0) {
      alert("La fecha de salida debe ser posterior al check-in.");
      return;
    }

    if (noches < minimoNoches) {
      alert(`La estadía mínima para este alojamiento es de ${minimoNoches} noche${minimoNoches > 1 ? "s" : ""}.`);
      return;
    }

    if (guests < 1 || guests > capacidad) {
      alert(`La cantidad de huéspedes debe ser entre 1 y ${capacidad}.`);
      return;
    }

    const total = noches * precioPorNoche;

    const nuevaReserva = {
      id: String(Date.now()),
      listingId: a.id,
      title: a.titulo || "Alojamiento",
      location: `${a.ciudad || ""}${a.provincia ? ", " + a.provincia : ""}`,
      cover: portada || "",
      userEmail: userActual.email || "",
      guestEmail: userActual.email || "",
      guestName: userActual.name || "Huésped",
      hostEmail: a.email || "",
      checkin: checkin,
      checkout: checkout,
      guests: guests,
      total: total,
      status: "pendiente",
      code: crearCodigoReserva()
    };

    reservasActuales.push(nuevaReserva);
    localStorage.setItem("tualoja_bookings", JSON.stringify(reservasActuales));

    alert("Reserva enviada al anfitrión.");
    location.href = "mis-reservas.html";
  });
})();
