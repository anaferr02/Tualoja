// resultados.js
import { getAlojamientos } from "./storage.js";

function qs(name) {
  const u = new URL(window.location.href);
  return u.searchParams.get(name);
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
  return String(s ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

function serviciosTexto(arr) {
  const s = Array.isArray(arr) ? arr.filter(Boolean) : [];
  if (!s.length) return "Servicios no especificados";
  return s.slice(0, 4).join(" • ");
}

function cardHTML(a) {
  const titulo = esc(a.titulo || "Alojamiento");
  const ciudad = esc(a.ciudad || "");
  const prov = a.provincia ? `, ${esc(a.provincia)}` : "";
  const tipo = esc(a.tipo || "Alojamiento");
  const cap = a.capacidad ? `${Number(a.capacidad)} huésped(es)` : "Capacidad N/D";

  const fotoURL = (a.fotos && a.fotos[0]) ? String(a.fotos[0]) : "";
  const foto = fotoURL
    ? `<img class="card-img" src="${fotoURL}" alt="Foto de ${titulo}">`
    : `<div class="card-img placeholder">Sin foto</div>`;

  return `
    <article class="card">
      <div class="card-media">
        ${foto}
        <div class="card-badges">
          <span class="badge">${tipo}</span>
          <span class="badge">${cap}</span>
        </div>
      </div>

      <div class="card-body">
        <h3 class="card-title">${titulo}</h3>
        <p class="card-sub">${ciudad}${prov}</p>

        <p class="card-meta">${esc(serviciosTexto(a.servicios))}</p>

        <p class="card-price">
          ${moneyARS(a.precio)} <span class="muted">/ noche</span>
        </p>

        <a class="btn" href="detalle.html?id=${encodeURIComponent(a.id)}">Ver alojamiento</a>
      </div>
    </article>
  `;
}

(function init() {
  const adultos = qs("adultos") || "";
  const habitaciones = qs("habitaciones") || "";

  const resumen = document.getElementById("resumenBusqueda");
  if (resumen) {
    const parts = [];
    if (adultos) parts.push(`${adultos} adulto(s)`);
    if (habitaciones) parts.push(`${habitaciones} habitación(es)`);
    resumen.textContent = parts.length
      ? `Búsqueda: ${parts.join(" · ")}`
      : "Mostrando todos los alojamientos publicados.";
  }

  const list = getAlojamientos();
  const grid = document.getElementById("gridResultados");
  const empty = document.getElementById("emptyResultados");

  if (!grid) return;

  if (!list.length) {
    if (empty) empty.style.display = "block";
    grid.innerHTML = "";
    return;
  }

  if (empty) empty.style.display = "none";
  grid.innerHTML = list.map(cardHTML).join("");
})();
