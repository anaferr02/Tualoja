import { db, auth } from "./firebase-config.js";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

let reservasCache = [];
let filtroActual = "todas";

function formatearEstado(estado = "pendiente") {
  const limpio = String(estado).toLowerCase();

  if (limpio === "aceptada" || limpio === "confirmada") {
    return { texto: "aceptada", clase: "estado-aceptada" };
  }

  if (limpio === "cancelada" || limpio === "rechazada") {
    return { texto: limpio, clase: "estado-cancelada" };
  }

  return { texto: "pendiente", clase: "estado-pendiente" };
}

function esperarUsuario() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user || null);
    });
  });
}

async function enriquecerReserva(r) {
  try {
    if (!r.alojamientoId) return r;

    const snap = await getDoc(doc(db, "alojamientos", r.alojamientoId));

    if (!snap.exists()) return r;

    const alojamiento = snap.data();

    return {
      ...r,
      alojamientoTitulo: alojamiento.titulo || r.alojamientoTitulo || "Reserva",
      alojamientoFoto: alojamiento.fotos?.[0] || r.alojamientoFoto || "",
      total: r.total || null
    };
  } catch (error) {
    console.warn("No se pudo enriquecer reserva:", error);
    return r;
  }
}

function puedeCancelar(r) {
  const estado = String(r.status || "pendiente").toLowerCase();

  if (!["pendiente", "aceptada", "confirmada"].includes(estado)) return false;
  if (r.chatIniciado === true) return false;
  if (r.puedeCancelarHuesped === false) return false;

  return true;
}

function renderReservas() {
  const lista = document.getElementById("listaReservas");
  if (!lista) return;

  const visibles = reservasCache.filter((r) => {
    if (filtroActual === "todas") return true;

    const estado = String(r.status || "pendiente").toLowerCase();

    if (filtroActual === "aceptada") {
      return estado === "aceptada" || estado === "confirmada";
    }

    return estado === filtroActual;
  });

  if (!visibles.length) {
    lista.innerHTML = `
      <div class="empty-box">
        No tenés reservas para este filtro.
      </div>
    `;
    return;
  }

  lista.innerHTML = visibles.map((r) => {
    const estado = formatearEstado(r.status);
    const titulo = r.alojamientoTitulo || r.title || r.titulo || "Reserva";
    const total = r.total
      ? `$${Number(r.total).toLocaleString("es-AR")}`
      : "A confirmar";

    const imagen = r.alojamientoFoto
      ? `<img class="reserva-img" src="${r.alojamientoFoto}" alt="${titulo}">`
      : `<div class="reserva-placeholder">Sin imagen</div>`;

    return `
      <article class="reserva-card">
        <div>
          ${imagen}
        </div>

        <div class="reserva-main">
          <h3>${titulo}</h3>
          <p><strong>Desde:</strong> ${r.checkin || "-"} — <strong>Hasta:</strong> ${r.checkout || "-"}</p>
          <p><strong>Huéspedes:</strong> ${r.guests || "-"}</p>
          <p><strong>Estado:</strong> <span class="estado-badge ${estado.clase}">${estado.texto}</span></p>
          <p><strong>Total:</strong> ${total}</p>

          ${
            r.noLeidoHuesped
              ? `<p style="color:#d93025; font-weight:700;">🔴 Nuevo mensaje</p>`
              : ""
          }

          ${
            r.ultimoMensaje
              ? `<p style="color:#6a7195; font-size:14px;">💬 ${r.ultimoMensaje}</p>`
              : ""
          }

          ${
            r.chatIniciado
              ? `<p style="margin-top:8px; color:#8c2e2e;"><strong>Chat activo:</strong> ya no podés cancelar online. Si hubo fuerza mayor, hacelo desde Ayuda.</p>`
              : ""
          }
        </div>

        <div class="reserva-side">
          <a class="btn-outline" href="detalle.html?id=${encodeURIComponent(r.alojamientoId || "")}">
            Ver detalle
          </a>

          ${
            ["aceptada", "confirmada"].includes(String(r.status || "").toLowerCase())
              ? `<a class="btn-outline" href="chat.html?reserva=${r._docId}">Abrir chat</a>`
              : ""
          }

          ${
            puedeCancelar(r)
              ? `<button class="btn-danger" data-cancel="${r._docId}">Cancelar</button>`
              : ""
          }
        </div>
      </article>
    `;
  }).join("");

  lista.querySelectorAll("[data-cancel]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-cancel");
      const reserva = reservasCache.find((r) => r._docId === id);

      if (!reserva) return;

      if (!puedeCancelar(reserva)) {
        alert("Esta reserva ya no se puede cancelar online.");
        return;
      }

      try {
        await updateDoc(doc(db, "reservas", id), {
          status: "cancelada"
        });

        const index = reservasCache.findIndex((r) => r._docId === id);
        if (index !== -1) {
          reservasCache[index].status = "cancelada";
        }

        renderReservas();
      } catch (error) {
        console.error("Error al cancelar reserva:", error);
        alert("No se pudo cancelar la reserva.");
      }
    });
  });
}

function activarBotonesFiltro() {
  const botonesFiltro = document.querySelectorAll("[data-filter]");

  botonesFiltro.forEach((btn) => {
    btn.onclick = () => {
      botonesFiltro.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filtroActual = btn.getAttribute("data-filter") || "todas";
      renderReservas();
    };
  });
}

async function cargarReservas() {
  const estadoCarga = document.getElementById("estadoCarga");
  const lista = document.getElementById("listaReservas");

  try {
    const user = await esperarUsuario();

    if (!user) {
      alert("Iniciá sesión para ver tus reservas.");
      location.href = "login.html";
      return;
    }

    const reservasRef = collection(db, "reservas");
    let rows = [];

    try {
      const q = query(reservasRef, where("huespedId", "==", user.uid));
      const snap = await getDocs(q);

      snap.forEach((d) => {
        rows.push({ ...d.data(), _docId: d.id });
      });
    } catch (error) {
      console.warn("No se pudo filtrar por huespedId, pruebo por email.", error);

      const snap = await getDocs(reservasRef);

      snap.forEach((d) => {
        const x = d.data();
        const emailReserva = (x.huespedEmail || x.guestEmail || "").toLowerCase();
        const emailUsuario = (user.email || "").toLowerCase();

        if (emailReserva === emailUsuario) {
          rows.push({ ...x, _docId: d.id });
        }
      });
    }

    rows.sort((a, b) => {
      const fa = a.creadaEn?.seconds || 0;
      const fb = b.creadaEn?.seconds || 0;
      return fb - fa;
    });

    reservasCache = await Promise.all(rows.map(enriquecerReserva));

    if (estadoCarga) estadoCarga.style.display = "none";
    renderReservas();
  } catch (error) {
    console.error("Error al cargar mis reservas:", error);

    if (estadoCarga) estadoCarga.style.display = "none";

    if (lista) {
      lista.innerHTML = `
        <div class="empty-box">
          No se pudieron cargar tus reservas.
        </div>
      `;
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.onclick = async (e) => {
      e.preventDefault();
      await signOut(auth);
      localStorage.removeItem("tualoja_user");
      localStorage.removeItem("tualoja_logged");
      location.href = "index.html";
    };
  }

  activarBotonesFiltro();
  await cargarReservas();
});
