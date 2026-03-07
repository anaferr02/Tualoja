import { getAlojamientoById } from "./storage.js";

function getId() {
  const u = new URL(window.location.href);
  return u.searchParams.get("id");
}

function moneyARS(n) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(Number(n) || 0);
}

function crearCodigoReserva() {
  return "R" + Math.floor(Math.random() * 900000 + 100000);
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
  return diff / (1000 * 60 * 60 * 24);
}

function hoyISO() {
  const hoy = new Date();
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, "0");
  const d = String(hoy.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function fechasOcupadas(listingId, inicio, fin) {
  const reservas = getReservas();

  const d1 = new Date(inicio + "T00:00:00");
  const d2 = new Date(fin + "T00:00:00");

  return reservas.some((r) => {
    if (String(r.listingId) !== String(listingId)) return false;
    if (r.status === "cancelada" || r.status === "rechazada") return false;
    if (!r.checkin || !r.checkout || r.checkin === "pendiente" || r.checkout === "pendiente") return false;

    const r1 = new Date(r.checkin + "T00:00:00");
    const r2 = new Date(r.checkout + "T00:00:00");

    return d1 < r2 && d2 > r1;
  });
}

(function () {
  const id = getId();
  const a = getAlojamientoById(id);

  const wrap = document.getElementById("detalleWrap");

  if (!wrap) return;

  if (!a) {
    wrap.innerHTML = "Alojamiento no encontrado";
    return;
  }

  const precio = Number(a.precio || 0);
  const capacidad = Number(a.capacidad || 1);
  const minimoNoches = Number(a.minimoNoches || 1);
  const hoy = hoyISO();

  wrap.innerHTML = `
    <h1>${a.titulo || "Alojamiento"}</h1>

    <p>${a.ciudad || ""} ${a.provincia || ""}</p>

    <div class="detalle-reserva-form">
      <label class="detalle-label">Check-in</label>
      <input class="detalle-input" type="date" id="checkin" min="${hoy}">

      <label class="detalle-label">Check-out</label>
      <input class="detalle-input" type="date" id="checkout" min="${hoy}">

      <label class="detalle-label">Huéspedes</label>
      <input class="detalle-input" type="number" id="guests" min="1" max="${capacidad}" value="1">

      <div class="detalle-total-box">
        Total estimado:
        <strong id="totalPrecio">${moneyARS(precio)}</strong>
      </div>

      <button class="detalle-btn-reservar" id="btnReservar" type="button">
        Reservar
      </button>
    </div>
  `;

  const checkin = document.getElementById("checkin");
  const checkout = document.getElementById("checkout");
  const guests = document.getElementById("guests");
  const totalBox = document.getElementById("totalPrecio");
  const btnReservar = document.getElementById("btnReservar");

  function actualizarPrecio() {
    const c1 = checkin.value;
    const c2 = checkout.value;

    if (!c1 || !c2) {
      totalBox.textContent = moneyARS(precio);
      return;
    }

    const noches = calcularNoches(c1, c2);

    if (noches <= 0) {
      totalBox.textContent = moneyARS(precio);
      return;
    }

    totalBox.textContent = `${moneyARS(noches * precio)} (${noches} noche${noches > 1 ? "s" : ""})`;
  }

  checkin.addEventListener("change", () => {
    if (checkin.value) {
      checkout.min = checkin.value;
      if (checkout.value && checkout.value <= checkin.value) {
        checkout.value = "";
      }
    }
    actualizarPrecio();
  });

  checkout.addEventListener("change", actualizarPrecio);

  guests.addEventListener("change", () => {
    let v = Number(guests.value || 1);
    if (v < 1) v = 1;
    if (v > capacidad) v = capacidad;
    guests.value = String(v);
  });

  btnReservar.addEventListener("click", () => {
    if (localStorage.getItem("tualoja_logged") !== "1") {
      alert("Tenés que iniciar sesión para reservar");
      location.href = "login.html";
      return;
    }

    const c1 = checkin.value;
    const c2 = checkout.value;

    if (!c1 || !c2) {
      alert("Elegí fechas");
      return;
    }

    const noches = calcularNoches(c1, c2);

    if (noches <= 0) {
      alert("Las fechas no son válidas");
      return;
    }

    if (noches < minimoNoches) {
      alert(`La estadía mínima es de ${minimoNoches} noche${minimoNoches > 1 ? "s" : ""}`);
      return;
    }

    if (fechasOcupadas(a.id, c1, c2)) {
      alert("Esas fechas ya están reservadas");
      return;
    }

    const user = JSON.parse(localStorage.getItem("tualoja_user") || "{}");
    const reservas = getReservas();

    const nuevaReserva = {
      id: Date.now(),
      listingId: a.id,
      title: a.titulo,
      location: (a.ciudad || "") + " " + (a.provincia || ""),
      cover: a.fotos && a.fotos[0] ? a.fotos[0] : "",
      guestName: user.name || "Huésped",
      guestEmail: user.email || "",
      userEmail: user.email || "",
      hostEmail: a.email || "",
      checkin: c1,
      checkout: c2,
      guests: Number(guests.value || 1),
      total: noches * precio,
      status: "pendiente",
      code: crearCodigoReserva()
    };

    reservas.push(nuevaReserva);
    localStorage.setItem("tualoja_bookings", JSON.stringify(reservas));

    alert("Reserva creada");
    location.href = "mis-reservas.html";
  });
})();
