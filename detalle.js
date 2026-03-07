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
  const capacidad = esc(a.capacidad || "-");
  const minimoNoches = esc(a.minimoNoches || 1);
  const portada = Array.isArray(a.fotos) && a.fotos.length ? String(a.fotos[0]) : "";

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

  const botonHTML = miReservaActiva
    ? `
      <button class="detalle-btn-reservar disabled" type="button" disabled>
        Ya reservado
      </button>
    `
    : `
      <button class="detalle-btn-reservar" id="btnReservar" type="button">
        Reservar
      </button>
    `;

  const ayudaHTML = miReservaActiva
    ? `Ya tenés una reserva para este alojamiento.`
    : `Te contactamos con el anfitrión para completar la reserva.`;

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
              <span class="detalle-precio-numero">${moneyARS(a.precio)}</span>
              <span class="detalle-precio-texto">por noche</span>
            </div>

            <p class="detalle-minimo">📅 Mínimo de noches: ${minimoNoches}</p>

            ${botonHTML}

            <div class="detalle-ayuda">
              ${ayudaHTML}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  const btnReservar = document.getElementById("btnReservar");

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
      checkin: "pendiente",
      checkout: "pendiente",
      guests: a.capacidad || 1,
      total: Number(a.precio) || 0,
      status: "pendiente",
      code: crearCodigoReserva()
    };

    reservasActuales.push(nuevaReserva);
    localStorage.setItem("tualoja_bookings", JSON.stringify(reservasActuales));

    alert("Reserva enviada al anfitrión.");
    location.href = "mis-reservas.html";
  });
})();
