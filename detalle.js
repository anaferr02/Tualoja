// detalle.js
import { getAlojamientoById } from "./storage.js";

function getId() {
  const u = new URL(window.location.href);
  return u.searchParams.get("id");
}

function moneyARS(n) {
  try {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(Number(n) || 0);
  } catch {
    return `$${Number(n) || 0}`;
  }
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
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

  const galeria = (a.fotos && a.fotos.length)
    ? `<div class="galeria">${a.fotos.map((src) => `<img class="galeria-img" src="${src}" alt="Foto">`).join("")}</div>`
    : `<div class="galeria"><div class="galeria-empty">Este alojamiento no cargó fotos todavía.</div></div>`;

  const servicios = (a.servicios && a.servicios.length) ? a.servicios.join(" · ") : "No especificados";

  const wa = (a.anfitrionWhatsapp || "").replace(/\D/g, "");
  const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(`Hola! Me interesa tu alojamiento "${a.titulo}" en TuAloja. ¿Está disponible?`)}` : "";
  const mail = a.anfitrionEmail ? `mailto:${encodeURIComponent(a.anfitrionEmail)}?subject=${encodeURIComponent("Consulta desde TuAloja")}&body=${encodeURIComponent(`Hola! Me interesa "${a.titulo}".`)}` : "";

  wrap.innerHTML = `
    <section class="detalle">
      <h1>${esc(a.titulo)}</h1>
      <p class="muted">${esc(a.ciudad)}${a.provincia ? `, ${esc(a.provincia)}` : ""}${a.zona ? ` · ${esc(a.zona)}` : ""}</p>

      ${galeria}

      <div class="detalle-box">
        <p>${esc(a.descripcion)}</p>
        <p><strong>Tipo:</strong> ${esc(a.tipo || "-")} · <strong>Capacidad:</strong> ${esc(a.capacidad || "-")} personas</p>
        <p><strong>Servicios:</strong> ${esc(servicios)}</p>
        <p class="detalle-precio"><strong>${moneyARS(a.precio)}</strong> <span class="muted">por noche</span></p>
        <p class="muted">Mínimo de noches: ${esc(a.minimoNoches || 1)}</p>

        <div class="detalle-cta">
          ${waLink ? `<a class="btn" href="${waLink}" target="_blank" rel="noopener">Contactar por WhatsApp</a>` : ""}
          ${mail ? `<a class="btn btn-sec" href="${mail}">Contactar por Email</a>` : ""}
        </div>
      </div>
    </section>
  `;
})();
