import { db } from "./firebase-config.js";
import { refreshMe } from "./public/js/auth.js";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const me = await refreshMe();

    if (!me) {
      alert("Iniciá sesión para ver tus reservas.");
      location.href = "login.html";
      return;
    }

    const container = document.querySelector("[data-reservas]");
    if (!container) return;

    const reservasRef = collection(db, "reservas");

    let rows = [];

    try {
      const q = query(reservasRef, where("huespedId", "==", me.id));
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
        const emailUsuario = (me.email || "").toLowerCase();

        if (emailReserva === emailUsuario) {
          rows.push({ ...x, _docId: d.id });
        }
      });
    }

    if (!rows.length) {
      container.innerHTML = `<p>No tenés reservas todavía.</p>`;
      return;
    }

    rows.sort((a, b) => {
      const fa = a.creadaEn?.seconds || 0;
      const fb = b.creadaEn?.seconds || 0;
      return fb - fa;
    });

    container.innerHTML = rows.map((r) => {
      const titulo = r.title || r.titulo || r.alojamientoTitulo || "Reserva";
      const total = r.total ? `$${Number(r.total).toLocaleString("es-AR")}` : "A confirmar";
      const estado = r.status || "pendiente";

      return `
        <div class="card" style="padding:12px;margin:10px 0;border-radius:12px;background:#fff;">
          <div style="font-weight:700;">${titulo}</div>
          <div>Desde: ${r.checkin || "-"} — Hasta: ${r.checkout || "-"}</div>
          <div>Huéspedes: ${r.guests || "-"}</div>
          <div>Estado: ${estado} — Total: ${total}</div>
          ${
            estado === "pendiente" || estado === "aceptada"
              ? `<button data-cancel="${r._docId}" style="margin-top:8px;">Cancelar</button>`
              : ""
          }
        </div>
      `;
    }).join("");

    container.querySelectorAll("button[data-cancel]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-cancel");

        try {
          await updateDoc(doc(db, "reservas", id), {
            status: "cancelada"
          });

          location.reload();
        } catch (err) {
          console.error(err);
          alert("No se pudo cancelar la reserva.");
        }
      });
    });
  } catch (error) {
    console.error("Error al cargar mis reservas:", error);

    const container = document.querySelector("[data-reservas]");
    if (container) {
      container.innerHTML = `<p>No se pudieron cargar tus reservas.</p>`;
    }
  }
});
