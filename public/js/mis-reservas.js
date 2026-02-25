import { api } from "./api.js";
import { refreshMe } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const me = await refreshMe();
  if (!me) {
    alert("Iniciá sesión para ver tus reservas.");
    location.href = "login.html";
    return;
  }

  const container = document.querySelector("[data-reservas]");
  if (!container) return;

  const rows = await api("/bookings/my");

  container.innerHTML = rows.map(r => `
    <div class="card" style="padding:12px;margin:10px 0;border-radius:12px;background:#fff;">
      <div style="font-weight:700;">${r.title}</div>
      <div>${r.city}, ${r.province}</div>
      <div>Desde: ${r.date_from} — Hasta: ${r.date_to}</div>
      <div>Estado: ${r.status} — Total: $${r.total}</div>
      ${r.status === "confirmed" ? `<button data-cancel="${r.id}" style="margin-top:8px;">Cancelar</button>` : ""}
    </div>
  `).join("");

  container.querySelectorAll("button[data-cancel]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-cancel");
      try {
        await api(`/bookings/${id}/cancel`, { method: "POST" });
        location.reload();
      } catch (err) {
        alert(err.message);
      }
    });
  });
});
