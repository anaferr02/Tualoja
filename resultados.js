function qs(name) {
  const u = new URL(window.location.href);
  return u.searchParams.get(name);
}

function moneyARS(n) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(Number(n) || 0);
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

  const fotoURL = (a.fotos && a.fotos[0]) ? a.fotos[0] : "";

  const foto = fotoURL
    ? `<img class="resultado-img" src="${fotoURL}">`
    : `<div class="resultado-img">Sin foto</div>`;

  return `
  <article class="resultado-card">

    ${foto}

    <div class="resultado-info">

      <h3>${esc(a.titulo)}</h3>

      <div>${esc(a.ciudad)}, ${esc(a.provincia)}</div>

      <div>${esc(serviciosTexto(a.servicios))}</div>

      <div class="resultado-precio">
        ${moneyARS(a.precio)} / noche
      </div>

      <a href="detalle.html?id=${a.id}">
        Ver alojamiento
      </a>

    </div>

  </article>
  `;
}

async function cargarAlojamientos() {

  const grid = document.getElementById("gridResultados");
  const empty = document.getElementById("emptyResultados");

  try {

    const res = await fetch("/api/listings");
    const alojamientos = await res.json();

    if (!alojamientos.length) {

      empty.style.display = "block";
      empty.textContent = "No hay alojamientos publicados.";

      return;
    }

    grid.innerHTML = alojamientos.map(cardHTML).join("");

  } catch (error) {

    console.error(error);

    empty.style.display = "block";
    empty.textContent = "Error cargando alojamientos.";

  }
}

cargarAlojamientos();
