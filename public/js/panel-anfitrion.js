import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("Iniciá sesión.");
      location.href = "login.html";
      return;
    }

    const listEl = document.querySelector("[data-mis-alojamientos]");
    const bookEl = document.querySelector("[data-reservas-host]");

    if (listEl) {
      try {
        const q = query(
          collection(db, "alojamientos"),
          where("anfitrionId", "==", user.uid)
        );

        const snap = await getDocs(q);

        if (snap.empty) {
          listEl.innerHTML = `<p>No publicaste alojamientos todavía.</p>`;
        } else {
          let html = "";

          snap.forEach((docSnap) => {
            const l = docSnap.data();
            const id = docSnap.id;

            html += `
              <div class="card" style="padding:12px;margin:10px 0;border-radius:12px;background:#fff;">
                <div style="font-weight:700;">${l.titulo || "Sin título"}</div>
                <div>${l.ciudad || "Sin ciudad"}, ${l.provincia || "Sin provincia"}</div>
                <div>$${l.precio || 0} por noche</div>
                <a href="detalle.html?id=${id}">Ver</a>
              </div>
            `;
          });

          listEl.innerHTML = html;
        }
      } catch (error) {
        console.error("Error al cargar alojamientos del anfitrión:", error);
        listEl.innerHTML = `<p>Error al cargar tus alojamientos.</p>`;
      }
    }

    if (bookEl) {
      try {
        const q = query(
          collection(db, "reservas"),
          where("hostId", "==", user.uid)
        );

        const snap = await getDocs(q);

        if (snap.empty) {
          bookEl.innerHTML = `<p>No tenés reservas todavía.</p>`;
        } else {
          let html = "";

          snap.forEach((docSnap) => {
            const b = docSnap.data();

            html += `
              <div class="card" style="padding:12px;margin:10px 0;border-radius:12px;background:#fff;">
                <div style="font-weight:700;">${b.title || "Reserva sin título"}</div>
                <div>Huésped: ${b.guestName || "Sin nombre"} (${b.guestEmail || "Sin email"})</div>
                <div>${b.checkin || "-"} → ${b.checkout || "-"} — ${b.status || "pendiente"}</div>
                <div>Total: $${b.total || 0}</div>
              </div>
            `;
          });

          bookEl.innerHTML = html;
        }
      } catch (error) {
        console.error("Error al cargar reservas del anfitrión:", error);
        bookEl.innerHTML = `<p>Error al cargar tus reservas.</p>`;
      }
    }
  });
});
