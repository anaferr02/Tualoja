import { db } from "./firebase-config.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const cont = document.getElementById("gridResultados");
const emptyResultados = document.getElementById("emptyResultados");

const params = new URLSearchParams(window.location.search);
const destino = (params.get("destino") || params.get("ubicacion") || params.get("q") || "").trim().toLowerCase();
const checkin = params.get("checkin") || "";
const checkout = params.get("checkout") || "";
const guests = params.get("guests") || params.get("huespedes") || "1";

const precioMinInput = document.getElementById("precioMin");
const precioMaxInput = document.getElementById("precioMax");
const precioMinTxt = document.getElementById("precioMinTxt");
const precioMaxTxt = document.getElementById("precioMaxTxt");
const ordenPrecioSelect = document.getElementById("ordenPrecio");

let markersActuales = [];

const coordsLugares = {
  "mendoza": [-32.8895, -68.8458],
  "capital federal": [-34.6037, -58.3816],
  "buenos aires": [-34.6037, -58.3816],
  "la plata": [-34.9214, -57.9544],
  "mar del plata": [-38.0055, -57.5426],
  "cordoba": [-31.4201, -64.1888],
  "villa carlos paz": [-31.4241, -64.4978],
  "salta": [-24.7821, -65.4232],
  "neuquen": [-38.9516, -68.0591],
  "bariloche": [-41.1335, -71.3103],
  "san carlos de bariloche": [-41.1335, -71.3103],
  "jujuy": [-24.1858, -65.2995],
  "tucuman": [-26.8083, -65.2176],
  "san miguel de tucuman": [-26.8083, -65.2176],
  "santa fe": [-31.6333, -60.7000],
  "rosario": [-32.9442, -60.6505],
  "entre rios": [-31.7319, -60.5238],
  "parana": [-31.7319, -60.5238],
  "misiones": [-27.3621, -55.9009],
  "posadas": [-27.3621, -55.9009],
  "chubut": [-43.3002, -65.1023],
  "puerto madryn": [-42.7692, -65.0385],
  "santa cruz": [-51.6230, -69.2168],
  "ushuaia": [-54.8019, -68.3030],
  "tierra del fuego": [-54.8019, -68.3030],
  "san juan": [-31.5375, -68.5364],
  "san luis": [-33.2950, -66.3356],
  "la rioja": [-29.4131, -66.8558],
  "catamarca": [-28.4696, -65.7852],
  "santiago del estero": [-27.7951, -64.2615],
  "formosa": [-26.1775, -58.1781],
  "resistencia": [-27.4514, -58.9867],
  "chaco": [-27.4514, -58.9867],
  "corrientes": [-27.4692, -58.8306]
};

function armarUbicacion(alojamiento) {
  const ciudad = alojamiento.ciudad || "";
  const provincia = alojamiento.provincia || "";

  if (ciudad && provincia) return `${ciudad} - ${provincia}`;
  if (ciudad) return ciudad;
  if (provincia) return provincia;
  return "Ubicación no informada";
}

function obtenerCentroPorDestino(destinoTexto) {
  if (!destinoTexto) return null;

  const limpio = destinoTexto.trim().toLowerCase();
  return coordsLugares[limpio] || null;
}

function obtenerCoordenadasAlojamiento(a, docId) {
  const lat = Number(a.lat);
  const lng = Number(a.lng);

  if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat !== 0 && lng !== 0) {
    return [lat, lng];
  }

  const ciudad = (a.ciudad || "").trim().toLowerCase();
  const provincia = (a.provincia || "").trim().toLowerCase();
  const ubicacion = (a.ubicacion || "").trim().toLowerCase();

  let base =
    coordsLugares[ciudad] ||
    coordsLugares[provincia] ||
    coordsLugares[ubicacion] ||
    null;

  if (!base) return null;

  const hash = [...String(docId || "0")].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const offsetLat = ((hash % 10) - 5) * 0.01;
  const offsetLng = (((hash * 3) % 10) - 5) * 0.01;

  return [base[0] + offsetLat, base[1] + offsetLng];
}

function crearIconoPrecio(precioTexto) {
  return L.divIcon({
    className: "custom-price-icon",
    html: `<div class="precio-marker">$${precioTexto}</div>`,
    iconSize: [1, 1],
    iconAnchor: [20, 20],
    popupAnchor: [0, -18]
  });
}

function limpiarHtml(texto = "") {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function esperarMapaListo() {
  return new Promise((resolve) => {
    if (window.mapaGlobal) {
      resolve(window.mapaGlobal);
      return;
    }

    window.addEventListener("mapa-listo", () => resolve(window.mapaGlobal), { once: true });
  });
}

function actualizarPrecioUI() {
  if (!precioMinInput || !precioMaxInput || !precioMinTxt || !precioMaxTxt) return;

  let min = Number(precioMinInput.value || 0);
  let max = Number(precioMaxInput.value || 0);

  if (min > max) {
    [min, max] = [max, min];
  }

  precioMinTxt.textContent = `$${min.toLocaleString("es-AR")}`;
  precioMaxTxt.textContent = `$${max.toLocaleString("es-AR")}`;
}

function limpiarMapa(mapa) {
  if (!mapa || !markersActuales.length) return;

  markersActuales.forEach((marker) => {
    mapa.removeLayer(marker);
  });

  markersActuales = [];
}

async function cargarResultados() {
  try {
    const mapa = await esperarMapaListo();
    const querySnapshot = await getDocs(collection(db, "alojamientos"));

    let html = "";
    let encontrados = 0;
    const markers = [];
    let alojamientos = [];

    limpiarMapa(mapa);

    querySnapshot.forEach((docSnap) => {
      const a = docSnap.data();

      const ciudad = (a.ciudad || "").toLowerCase();
      const provincia = (a.provincia || "").toLowerCase();
      const ubicacion = (a.ubicacion || "").toLowerCase();
      const titulo = (a.titulo || "").toLowerCase();

      const coincideDestino =
        !destino ||
        ciudad.includes(destino) ||
        provincia.includes(destino) ||
        ubicacion.includes(destino) ||
        titulo.includes(destino);

      const tiposSeleccionados = Array.from(
        document.querySelectorAll(".filtro-tipo:checked")
      ).map((e) => e.value);

      const serviciosSeleccionados = Array.from(
        document.querySelectorAll(".filtro-servicio:checked")
      ).map((e) => e.value);

      const coincideTipo =
        tiposSeleccionados.length === 0 ||
        tiposSeleccionados.includes(a.tipo);

      const coincideServicios =
        serviciosSeleccionados.length === 0 ||
        serviciosSeleccionados.every((s) => (a.servicios || []).includes(s));

      let precioMin = 0;
      let precioMax = Number.MAX_SAFE_INTEGER;

      if (precioMinInput && precioMaxInput) {
        precioMin = Number(precioMinInput.value || 0);
        precioMax = Number(precioMaxInput.value || 0);

        if (precioMin > precioMax) {
          [precioMin, precioMax] = [precioMax, precioMin];
        }
      }

      const precioAlojamiento = Number(a.precio || 0);

      const coincidePrecio =
        precioAlojamiento >= precioMin &&
        precioAlojamiento <= precioMax;

      if (coincideDestino && coincideTipo && coincideServicios && coincidePrecio) {
        alojamientos.push({
          ...a,
          id: docSnap.id
        });
      }
    });

    const orden = ordenPrecioSelect?.value || "";

    if (orden === "menor") {
      alojamientos.sort((a, b) => Number(a.precio || 0) - Number(b.precio || 0));
    }

    if (orden === "mayor") {
      alojamientos.sort((a, b) => Number(b.precio || 0) - Number(a.precio || 0));
    }

    alojamientos.forEach((a) => {
      encontrados++;

      const foto = a.fotos?.[0] || "https://via.placeholder.com/800x500?text=Sin+imagen";
      const precioNumero = Number(a.precio || 0);
      const precio = precioNumero.toLocaleString("es-AR");
      const ubicacionTexto = armarUbicacion(a);
      const tituloTexto = a.titulo || "Alojamiento sin título";
      const tipoTexto = a.tipo || "Alojamiento";

      html += `
        <div class="resultado-card">
          <img class="resultado-img" src="${foto}" alt="${limpiarHtml(tituloTexto)}">

          <div class="resultado-info">
            <h3 class="resultado-titulo">${limpiarHtml(tituloTexto)}</h3>

            <div class="resultado-ubicacion">
              ${limpiarHtml(ubicacionTexto)}
            </div>

            <div style="margin-bottom:10px; color:#666; font-size:15px;">
              ${limpiarHtml(tipoTexto)}
            </div>

            <div class="resultado-precio">
              $${precio} <span>/ noche</span>
            </div>

            <div class="resultado-acciones">
              <a href="detalle.html?id=${a.id}&destino=${encodeURIComponent(destino)}&checkin=${encodeURIComponent(checkin)}&checkout=${encodeURIComponent(checkout)}&guests=${encodeURIComponent(guests)}">
                Ver alojamiento
              </a>
            </div>
          </div>
        </div>
      `;

      const coords = obtenerCoordenadasAlojamiento(a, a.id);

      if (coords && mapa) {
        const marker = L.marker(coords, {
          icon: crearIconoPrecio(precio)
        }).addTo(mapa);

        marker.bindPopup(`
          <strong>${limpiarHtml(tituloTexto)}</strong><br>
          ${limpiarHtml(ubicacionTexto)}<br>
          ${limpiarHtml(tipoTexto)}<br>
          $${precio} por noche<br><br>
          <a href="detalle.html?id=${a.id}&destino=${encodeURIComponent(destino)}&checkin=${encodeURIComponent(checkin)}&checkout=${encodeURIComponent(checkout)}&guests=${encodeURIComponent(guests)}">
            Ver alojamiento
          </a>
        `);

        markers.push(marker);
      }
    });

    cont.innerHTML = html;

    if (emptyResultados) {
      if (encontrados === 0) {
        emptyResultados.style.display = "block";
        emptyResultados.textContent = "Todavía no hay alojamientos disponibles para ese destino. Probá con otra ciudad o cambiá los filtros.";
      } else {
        emptyResultados.style.display = "none";
        emptyResultados.textContent = "";
      }
    }

    if (mapa) {
      markersActuales = markers;

      if (markers.length > 0) {
        const group = L.featureGroup(markers);
        mapa.fitBounds(group.getBounds(), { padding: [30, 30] });

        if (mapa.getZoom() > 14) {
          mapa.setZoom(14);
        }
      } else {
        const centro = obtenerCentroPorDestino(destino);
        if (centro) {
          mapa.setView(centro, 10);
        } else {
          mapa.setView([-34.6037, -58.3816], 5);
        }
      }
    }
  } catch (error) {
    console.error("Error al cargar resultados:", error);
    cont.innerHTML = `<p class="empty-estado">Hubo un error al cargar los alojamientos.</p>`;
    if (emptyResultados) emptyResultados.style.display = "none";
  }
}

document.addEventListener("change", (e) => {
  if (
    e.target.classList.contains("filtro-tipo") ||
    e.target.classList.contains("filtro-servicio") ||
    e.target.id === "ordenPrecio"
  ) {
    cargarResultados();
  }
});

precioMinInput?.addEventListener("input", () => {
  actualizarPrecioUI();
  cargarResultados();
});

precioMaxInput?.addEventListener("input", () => {
  actualizarPrecioUI();
  cargarResultados();
});

document.addEventListener("DOMContentLoaded", () => {
  actualizarPrecioUI();
  cargarResultados();
});
