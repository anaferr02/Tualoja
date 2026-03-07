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

function normalizarTexto(txt) {
  return String(txt ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function serviciosTexto(arr) {
  const s = Array.isArray(arr) ? arr.filter(Boolean) : [];
  if (!s.length) return "Servicios no especificados";
  return s.slice(0, 4).join(" • ");
}

function coincideDestino(alojamiento, destinoBuscado) {
  if (!destinoBuscado) return true;

  const destino = normalizarTexto(destinoBuscado);

  const ciudad = normalizarTexto(alojamiento.ciudad);
  const provincia = normalizarTexto(alojamiento.provincia);
  const titulo = normalizarTexto(alojamiento.titulo);
  const tipo = normalizarTexto(alojamiento.tipo);

  return (
    ciudad.includes(destino) ||
    provincia.includes(destino) ||
    titulo.includes(destino) ||
    tipo.includes(destino)
  );
}

function cardHTML(a) {
  const titulo = esc(a.titulo || "Alojamiento");
  const ciudad = esc(a.ciudad || "");
  const prov = a.provincia ? `, ${esc(a.provincia)}` : "";
  const servicios = esc(serviciosTexto(a.servicios));
  const precio = moneyARS(a.precio);

  const fotoURL = (a.fotos && a.fotos[0]) ? String(a.fotos[0]) : "";

  const foto = fotoURL
    ? `<img class="resultado-img" src="${fotoURL}" alt="Foto de ${titulo}">`
    : `<div class="resultado-img" style="display:flex;align-items:center;justify-content:center;background:#ececf4;color:#666;font-size:18px;">Sin foto</div>`;

  return `
    <article class="resultado-card">
      ${foto}

      <div class="resultado-info">
        <h3 class="resultado-titulo">${titulo}</h3>
        <div class="resultado-ubicacion">${ciudad}${prov}</div>
        <div class="resultado-meta">${servicios}</div>
        <div class="resultado-precio">${precio} <span>/ noche</span></div>

        <div class="resultado-acciones">
          <a href="detalle.html?id=${encodeURIComponent(a.id)}">Ver alojamiento</a>
        </div>
      </div>
    </article>
  `;
}

(function init() {
  const destino =
    qs("destino") ||
    qs("ubicacion") ||
    qs("q") ||
    "";

  const adultos = qs("adultos") || "";
  const habitaciones = qs("habitaciones") || "";

  const resumen = document.getElementById("resumenBusqueda");
  const alerta = document.getElementById("alertaBusqueda");
  const grid = document.getElementById("gridResultados");
  const empty = document.getElementById("emptyResultados");

  if (!grid) return;

  const list = getAlojamientos();
  const filtrados = list.filter((a) => coincideDestino(a, destino));

  if (resumen) {
    const partes = [];

    if (destino) partes.push(`Destino: ${destino}`);
    if (adultos) partes.push(`${adultos} adulto(s)`);
    if (habitaciones) partes.push(`${habitaciones} habitación(es)`);

    resumen.textContent = partes.length
      ? partes.join(" · ")
      : "Mostrando todos los alojamientos publicados.";
  }

  if (!list.length) {
    if (empty) {
      empty.style.display = "block";
      empty.textContent = "No hay alojamientos todavía. Publicá el primero 🙌";
    }
    grid.innerHTML = "";
    if (alerta) alerta.style.display = "none";
    return;
  }

  if (!filtrados.length) {
    grid.innerHTML = "";

    if (empty) {
      empty.style.display = "block";
      empty.textContent = destino
        ? `No se encontraron alojamientos en ${destino}.`
        : "No se encontraron alojamientos para esta búsqueda.";
    }

    if (alerta && destino) {
      alerta.style.display = "block";
      alerta.innerHTML = `
        <strong>No se encontraron alojamientos en ${esc(destino)}</strong>.<br>
        Probá con otra ciudad o cambiá la búsqueda.
        <br>
        <a href="index.html">Cambiar búsqueda</a>
      `;
    }

    return;
  }

  if (empty) empty.style.display = "none";
  if (alerta) alerta.style.display = "none";

  grid.innerHTML = filtrados.map(cardHTML).join("");
})();
