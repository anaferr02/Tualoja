// resultados.js
import { getAlojamientos } from "./storage.js";

function qs(name) {
  const u = new URL(window.location.href);
  return u.searchParams.get(name);
}

function moneyARS(n) {
  try {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(Number(n) || 0);
  } catch {
    return `$${Number(n) || 0}`;
  }
}

function cardHTML(a) {
  const foto = (a.fotos && a.fotos[0]) ? `<img class="card-img" src="${a.fotos[0]}" alt="Foto de ${a.titulo}">` : `<div class="card-img placeholder">Sin foto</div>`;
  return `
    <article class="card">
      ${foto}
      <div class="card-body">
        <h3 class="card-title">${a.titulo}</h3>
        <p class="card-sub">${a.ciudad}${a.provincia ? `, ${a.provincia}` : ""}</p>
        <p class="card-price">${moneyARS(a.precio)} <span class="muted">/ noche</span></p>
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
    resumen.textContent = parts.length ? `Búsqueda: ${parts.join(" · ")}` : "Mostrando todos los alojamientos publicados.";
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

  grid.innerHTML = list.map(cardHTML).join("");
})();
