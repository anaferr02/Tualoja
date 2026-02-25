import { api } from "./api.js";
import { refreshMe } from "./auth.js";

function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

document.addEventListener("DOMContentLoaded", async () => {
  const id = qs("id");
  if (!id) return;

  const data = await api(`/listings/${id}`);
  // Pintado mínimo: adaptalo a tu HTML (esto no rompe diseño, solo rellena si encuentra elementos)
  document.querySelector("[data-title]") && (document.querySelector("[data-title]").textContent = data.title);
  document.querySelector("[data-city]") && (document.querySelector("[data-city]").textContent = `${data.city}, ${data.province}`);
  document.querySelector("[data-price]") && (document.querySelector("[data-price]").textContent = `$${data.price_per_night} por noche`);
  document.querySelector("[data-desc]") && (document.querySelector("[data-desc]").textContent = data.description);
  if (data.cover_image_url && document.querySelector("[data-cover]")) {
    document.querySelector("[data-cover]").src = data.cover_image_url;
  }

  const form = document.querySelector("[data-booking-form]");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const me = await refreshMe();
    if (!me) {
      alert("Iniciá sesión para reservar.");
      location.href = "login.html";
      return;
    }

    const date_from = document.querySelector('[name="date_from"]')?.value;
    const date_to = document.querySelector('[name="date_to"]')?.value;
    const guests = Number(document.querySelector('[name="guests"]')?.value || 1);

    try {
      await api("/bookings", {
        method: "POST",
        body: { listing_id: Number(id), date_from, date_to, guests }
      });
      alert("¡Reserva confirmada!");
      location.href = "mis-reservas.html";
    } catch (err) {
      alert(err.message);
    }
  });
});
