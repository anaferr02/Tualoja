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

function normalizarWhatsapp(telefono) {
  return String(telefono || "").replace(/\D/g, "");
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

  const servicios = (a.servicios && a.servicios.length)
    ? a.servicios.join(" · ")
    : "No especificados";

  const ubicacion = `${esc(a.ciudad || "")}${a.provincia ? `, <strong>${esc(a.provincia)}</strong>` : ""}${a.zona ? ` • ${esc(a.zona)}` : ""}`;

  const descripcion = esc(a.descripcion || "Este alojamiento no tiene descripción todavía.");
  const tipo = esc(a.tipo || "Alojamiento");
  const capacidad = esc(a.capacidad || "-");
  const minimoNoches = esc(a.minimoNoches || 1);

  const wa = normalizarWhatsapp(a.anfitrionWhatsapp);
  const mail = String(a.anfitrionEmail || "").trim();

  let reservarLink = "";
  if (wa) {
    reservarLink = `https://wa.me/${wa}?text=${encodeURIComponent(`Hola! Quiero reservar "${a.titulo}" que vi en TuAloja. ¿Está disponible?`)}`;
  } else if (mail) {
    reservarLink = `mailto:${encodeURIComponent(mail)}?subject=${encodeURIComponent(`Reserva en TuAloja: ${a.titulo}`)}&body=${encodeURIComponent(`Hola! Quiero reservar "${a.titulo}". ¿Está disponible?`)}`;
  }

  let galeriaHTML = "";
  if (a.fotos && a.fotos.length) {
    galeriaHTML = `
      <div class="detalle-galeria">
        <img src="${esc(a.fotos[0])}" alt="Foto de ${esc(a.titulo)}">
      </div>
    `;
  } else {
    galeriaHTML = `
      <div class="detalle-galeria">
        <div class="detalle-galeria-empty">
          <div class="icono">📷</div>
          <div class="texto">Este alojamiento no cargó fotos todavía.</div>
        </div>
      </div>
    `;
  }

  const botonReservar = `
<button class="detalle-btn-reservar" id="btnReservar">
Reservar
</button>
`;
  wrap.innerHTML = `
    <section class="detalle-layout">
      <h1>${esc(a.titulo)}</h1>

      <p class="detalle-ubicacion-top">📍 ${ubicacion}</p>

      ${!a.fotos || !a.fotos.length ? `<p class="detalle-subtexto">Este alojamiento no cargó fotos todavía.</p>` : ""}

      <p class="detalle-descripcion-top">${descripcion}</p>
      const btn = document.getElementById("btnReservar");

if(btn){

btn.addEventListener("click", () => {

if(localStorage.getItem("tualoja_logged") !== "1"){
alert("Tenés que iniciar sesión para reservar.");
location.href="login.html";
return;
}

const user = JSON.parse(localStorage.getItem("tualoja_user") || "{}");

const reservas = JSON.parse(localStorage.getItem("tualoja_bookings") || "[]");

const nuevaReserva = {
id: Date.now().toString(),
listingId: a.id,
title: a.titulo,
location: a.ciudad + ", " + a.provincia,
cover: a.fotos?.[0] || "",
userEmail: user.email,
guestName: user.name || "Huésped",
hostEmail: a.email || "",
checkin: "pendiente",
checkout: "pendiente",
guests: a.capacidad || 1,
total: a.precio,
status: "pendiente",
code: "R" + Math.floor(Math.random()*1000000)
};

reservas.push(nuevaReserva);

localStorage.setItem("tualoja_bookings", JSON.stringify(reservas));

alert("Reserva enviada al anfitrión.");

location.href="mis-reservas.html";

});

}

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

            ${botonReservar}

            <div class="detalle-ayuda">
              ${reservarLink ? "Te contactamos con el anfitrión para completar la reserva." : "Este alojamiento todavía no tiene un medio de contacto disponible."}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
})();
