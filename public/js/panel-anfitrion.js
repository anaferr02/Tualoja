import { api } from "./api.js";
import { refreshMe } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const me = await refreshMe();
  if (!me) {
    alert("Iniciá sesión.");
    location.href = "login.html";
    return;
  }

  const listEl = document.querySelector("[data-mis-alojamientos]");
  const bookEl = document.querySelector("[data-reservas-host]");

  if (listEl) {
    const listings = await api("/listings/me/host");
    listEl.innerHTML = listings.map(l => `
      <div class="card" style="padding:12px;margin:10px 0;border-radius:12px;background:#fff;">
        <div style="font-weight:700;">${l.title}</div>
        <div>${l.city}, ${l.province}</div>
        <div>$${l.price_per_night} por noche — ${l.status}</div>
        <a href="detalle.html?id=${l.id}">Ver</a>
      </div>
    `).join("");
  }

  if (bookEl) {
    const bookings = await api("/bookings/host");
    bookEl.innerHTML = bookings.map(b => `
      <div class="card" style="padding:12px;margin:10px 0;border-radius:12px;background:#fff;">
        <div style="font-weight:700;">${b.title}</div>
        <div>Huésped: ${b.guest_name} (${b.guest_email})</div>
        <div>${b.date_from} → ${b.date_to} — ${b.status}</div>
        <div>Total: $${b.total}</div>
      </div>
    `).join("");
  }
});
