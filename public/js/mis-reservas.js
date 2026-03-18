import { db } from "./firebase-config.js";
import { refreshMe } from "./public/js/auth.js";
import {
  collection,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  const me = await refreshMe();
  if (!me) {
    alert("Iniciá sesión para ver tus reservas.");
    location.href = "login.html";
    return;
  }

  const container = document.querySelector("[data-reservas]");
  if (!container) return;

  const snap = await getDocs(collection(db, "reservas"));
  const rows = [];

  snap.forEach((d) => {
    const x = d.data();
    if ((x.guestEmail || "").toLowerCase() === (me.email || "").toLowerCase()) {
      rows.push({ ...x, _docId: d.id });
    }
  });

  if (!rows.length) {
    container.innerHTML = `<p>No tenés reservas todavía.</p>`;
    return;
  }

  container.innerHTML = rows.map(r => `
    <div class="card" style="padding:12px;margin:10px 0;border-radius:12px;background:#fff;">
      <div style="font-weight:700;">${r.title}</div>
      <div>Desde: ${r.checkin} — Hasta: ${r.checkout}</div>
      <div>Estado: ${r.status} — Total: $${r.total}</div>
      ${r.status === "pendiente" || r.status === "aceptada"
        ? `<button data-cancel="${r._docId}" style="margin-top:8px;">Cancelar</button>`
        : ""
      }
    </div>
  `).join("");

  container.querySelectorAll("button[data-cancel]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-cancel");
      try {
        await updateDoc(doc(db, "reservas", id), { status: "cancelada" });
        location.reload();
      } catch (err) {
        console.error(err);
        alert("No se pudo cancelar la reserva.");
      }
    });
  });
});
