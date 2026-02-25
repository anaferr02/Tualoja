// Lee un buscador típico en index y manda a resultados.html con querystring
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const city = (document.querySelector('[name="destino"]')?.value || document.querySelector("#destino")?.value || "").trim();
    const date_from = (document.querySelector('[name="fecha_desde"]')?.value || document.querySelector("#fecha_desde")?.value || "").trim();
    const date_to = (document.querySelector('[name="fecha_hasta"]')?.value || document.querySelector("#fecha_hasta")?.value || "").trim();
    const guests = (document.querySelector('[name="huespedes"]')?.value || document.querySelector("#huespedes")?.value || "").trim();

    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (date_from) params.set("date_from", date_from);
    if (date_to) params.set("date_to", date_to);
    if (guests) params.set("guests", guests);

    location.href = `resultados.html?${params.toString()}`;
  });
});
