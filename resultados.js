import { db } from "./firebase-config.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const cont = document.getElementById("gridResultados");
const empty = document.getElementById("emptyResultados");
const resumenBusqueda = document.getElementById("resumenBusqueda");

const params = new URLSearchParams(window.location.search);

const destinoBuscado = (params.get("destino") || params.get("ubicacion") || params.get("q") || "").trim();
const checkinBuscado = (params.get("checkin") || "").trim();
const checkoutBuscado = (params.get("checkout") || "").trim();
const guestsBuscado = (params.get("guests") || params.get("huespedes") || "1").trim();

let mapa;
let markersLayer;

function escapeHTML(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPrecio(n) {
  const num = Number(n || 0);
  try {
    return num.toLocaleString("es-AR");
  } catch {
    return String(num);
  }
}

function normalizar(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sinEspacios(texto) {
  return normalizar(texto).replace(/\s+/g, "");
}

function guardarBusquedaActual() {
  localStorage.setItem("searchDestino", destinoBuscado || "");
  localStorage.setItem("searchCheckin", checkinBuscado || "");
  localStorage.setItem("searchCheckout", checkoutBuscado || "");
  localStorage.setItem("searchGuests", guestsBuscado || "1");
}

function initMapa() {
  const mapaEl = document.getElementById("mapa");
  if (!mapaEl || typeof L === "undefined") return;

  mapa = L.map("mapa").setView([-31.4201, -64.1888], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(mapa);

  markersLayer = L.layerGroup().addTo(mapa);

  setTimeout(() => mapa.invalidateSize(), 300);
}

function renderMapa(alojamientos) {
  if (!mapa || !markersLayer) return;

  markersLayer.clearLayers();

  const puntos = [];

  alojamientos.forEach((a) => {
    const lat = Number(a.lat);
    const lng = Number(a.lng);

    if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat && lng) {
      const marker = L.marker([lat, lng]).addTo(markersLayer);
      marker.bindPopup(`
        <b>${escapeHTML(a.titulo || "Alojamiento")}</b><br>
        ${escapeHTML(a.ciudad || "")} - ${escapeHTML(a.provincia || "")}<br>
        ARS $${formatPrecio(a.precio)}
      `);
      puntos.push([lat, lng]);
    }
  });

  if (puntos.length === 1) {
    mapa.setView(puntos[0], 12);
  } else if (puntos.length > 1) {
    mapa.fitBounds(puntos, { padding: [30, 30] });
  }
}

function coincideDestino(a, destino) {
  if (!destino) return true;

  const textoNormal = normalizar([
    a.titulo,
    a.ciudad,
    a.provincia,
    a.pais,
    a.direccion,
    a.referencia
  ].join(" "));

  const textoCompacto = sinEspacios([
    a.titulo,
    a.ciudad,
    a.provincia,
    a.pais,
    a.direccion,
    a.referencia
  ].join(" "));

  const destinoNormal = normalizar(destino);
  const destinoCompacto = sinEspacios(destino);

  const palabras = destinoNormal.split(" ").filter(Boolean);
  const coincidencias = palabras.filter((p) => textoNormal.includes(p)).length;
  const minimoNecesario = palabras.length >= 3 ? 2 : 1;

  const coincidePorPalabras = coincidencias >= minimoNecesario;
  const coincideCompacto = destinoCompacto && textoCompacto.includes(destinoCompacto);

  return coincidePorPalabras || coincideCompacto;
}

function armarLinkDetalle(idPublico) {
  return `detalle.html?id=${encodeURIComponent(idPublico)}`;
}

async function cargarResultados() {
  try {
    guardarBusquedaActual();

    const querySnapshot = await getDocs(collection(db, "alojamientos"));

    const todos = [];

    querySnapshot.forEach((docSnap) => {
      const a = docSnap.data();
      todos.push({
        ...a,
        _docId: docSnap.id
      });
    });

    const activos = todos.filter((a) => (a.status || "activo") === "activo");
    const filtrados = activos.filter((a) => coincideDestino(a, destinoBuscado));

    cont.innerHTML = "";

    if (!filtrados.length) {
      empty.style.display = "block";

      if (resumenBusqueda) {
        resumenBusqueda.textContent = destinoBuscado
          ? `No encontramos resultados para "${destinoBuscado}".`
          : "No hay alojamientos disponibles.";
      }

      renderMapa([]);
      return;
    }

    empty.style.display = "none";

    if (resumenBusqueda) {
      resumenBusqueda.textContent = destinoBuscado
        ? `${filtrados.length} alojamiento(s) para "${destinoBuscado}".`
        : `${filtrados.length} alojamiento(s) disponibles.`;
    }

    let html = "";

    filtrados.forEach((a) => {
      const idPublico = a.id || a._docId;
      const linkDetalle = armarLinkDetalle(idPublico);

      html += `
        <div class="resultado-card">
          <img
            class="resultado-img"
            src="${a.fotos?.[0] || "https://via.placeholder.com/400x250?text=Sin+imagen"}"
            alt="${escapeHTML(a.titulo || "Alojamiento")}"
          >

          <div class="resultado-info">
            <h3 class="resultado-titulo">${escapeHTML(a.titulo || "Sin título")}</h3>

            <div class="resultado-ubicacion">
              ${escapeHTML(a.ciudad || "Sin ciudad")} - ${escapeHTML(a.provincia || "Sin provincia")}
            </div>

            <div class="resultado-precio">
              ARS $${formatPrecio(a.precio)} <span>/ noche</span>
            </div>

            <div class="resultado-acciones">
              <a class="ver-detalle-link" href="${linkDetalle}">Ver alojamiento</a>
            </div>
          </div>
        </div>
      `;
    });

    cont.innerHTML = html;

    document.querySelectorAll(".ver-detalle-link").forEach((link) => {
      link.addEventListener("click", () => {
        guardarBusquedaActual();
      });
    });

    renderMapa(filtrados);
  } catch (error) {
    console.error("Error al cargar resultados:", error);
    cont.innerHTML = `<p>Hubo un error al cargar los alojamientos.</p>`;
  }
}

initMapa();
cargarResultados();
