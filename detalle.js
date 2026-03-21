import { db, auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const cont = document.getElementById("detalleWrap");
const noExiste = document.getElementById("noExiste");

let usuarioActual = null;

onAuthStateChanged(auth, (user) => {
  usuarioActual = user;
});

function escapeHTML(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function nochesEntre(checkin, checkout) {
  if (!checkin || !checkout) return 0;
  const d1 = new Date(checkin + "T00:00:00");
  const d2 = new Date(checkout + "T00:00:00");
  const diff = d2 - d1;
  return diff / (1000 * 60 * 60 * 24);
}

function generarCodigoReserva() {
  return "RES-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function rangosSePisan(aInicio, aFin, bInicio, bFin) {
  return aInicio < bFin && aFin > bInicio;
}

async function cargarReservasAceptadas(listingId) {
  const q = query(
    collection(db, "reservas"),
    where("listingId", "==", listingId),
    where("status", "==", "aceptada")
  );

  const snap = await getDocs(q);
  const reservas = [];
  snap.forEach((d) => reservas.push(d.data()));
  return reservas;
}

async function cargarDetalle() {
  try {
    if (!id) return noExiste.style.display = "block";

    const docRef = doc(db, "alojamientos", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return noExiste.style.display = "block";

    const alojamiento = docSnap.data();
    const alojamientoId = docSnap.id;

    const reservasAceptadas = await cargarReservasAceptadas(alojamientoId);

    cont.innerHTML = `
      <h1>${escapeHTML(alojamiento.titulo)}</h1>
      <p>${escapeHTML(alojamiento.ciudad)} - ${escapeHTML(alojamiento.provincia)}</p>

      <input id="checkinInput" type="date">
      <input id="checkoutInput" type="date">
      <button id="btnReservar">Reservar</button>
      <p id="msgReserva"></p>
    `;

    const checkinInput = document.getElementById("checkinInput");
    const checkoutInput = document.getElementById("checkoutInput");
    const btnReservar = document.getElementById("btnReservar");
    const msgReserva = document.getElementById("msgReserva");

    function fechasDisponibles(checkin, checkout) {
      const inicio = new Date(checkin);
      const fin = new Date(checkout);

      return !reservasAceptadas.some((r) => {
        const rInicio = new Date(r.checkin);
        const rFin = new Date(r.checkout);
        return rangosSePisan(inicio, fin, rInicio, rFin);
      });
    }

    btnReservar.addEventListener("click", async () => {
      if (!usuarioActual) {
        location.href = "login.html";
        return;
      }

      const checkin = checkinInput.value;
      const checkout = checkoutInput.value;
      const noches = nochesEntre(checkin, checkout);

      if (!checkin || !checkout || noches <= 0) {
        msgReserva.textContent = "Fechas inválidas";
        return;
      }

      if (!fechasDisponibles(checkin, checkout)) {
        msgReserva.textContent = "Fechas ocupadas";
        return;
      }

      const total = (alojamiento.precio || 0) * noches;

      try {
        await addDoc(collection(db, "reservas"), {
          code: generarCodigoReserva(),

          // 🔥 CLAVE
          listingId: alojamientoId,
          title: alojamiento.titulo,

          // 🔥 HOST (MUY IMPORTANTE)
          hostId: alojamiento.anfitrionId || "",
          hostEmail: alojamiento.anfitrionEmail || "",

          // 🔥 HUÉSPED
          guestId: usuarioActual.uid,
          guestEmail: usuarioActual.email,
          guestName: usuarioActual.displayName || "Huésped",

          checkin,
          checkout,
          total,

          status: "pendiente",

          // 🔥 NUEVO (IMPORTANTE)
          createdAt: serverTimestamp(),
          createdBy: usuarioActual.uid
        });

        msgReserva.textContent = "✅ Reserva enviada";
      } catch (err) {
        console.error(err);
        msgReserva.textContent = "Error al reservar";
      }
    });

  } catch (error) {
    console.error(error);
    noExiste.style.display = "block";
  }
}

cargarDetalle();
