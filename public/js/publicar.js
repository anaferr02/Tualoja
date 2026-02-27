import { api } from "./api.js";
import { refreshMe } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const me = await refreshMe();
  if (!me) {
    alert("Tenés que iniciar sesión para publicar.");
    location.href = "login.html";
    return;
  }

  // ✅ IMPORTANTE:
  // En publicar.html usamos FormSubmit (mail). Este archivo NO debe frenar el submit ahí.
  // Si querés publicar por API, hacelo en otra página (por ej: publicar-api.html).
  const isWizardFormSubmit =
    document.querySelector('form[action*="formsubmit.co"]') !== null;

  if (isWizardFormSubmit) {
    // No tocamos nada: el wizard + FormSubmit funciona normal ✅
    return;
  }

  // ⬇️ Si en el futuro tenés otro form (API), ahí sí engancha:
  const form = document.querySelector("form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = (document.querySelector('[name="titulo"]')?.value
      || document.querySelector("#titulo")?.value
      || document.querySelector('[name="nombre"]')?.value
      || "").trim();

    const description = (document.querySelector('[name="descripcion"]')?.value
      || document.querySelector("#descripcion")?.value
      || "").trim();

    const province = (document.querySelector('[name="provincia"]')?.value
      || document.querySelector("#provincia")?.value
      || "").trim();

    const city = (document.querySelector('[name="ciudad"]')?.value
      || document.querySelector("#ciudad")?.value
      || "").trim();

    const capacity = Number(
      document.querySelector('[name="capacidad"]')?.value
      || document.querySelector("#capacidad")?.value
      || 1
    );

    const price_per_night = Number(
      document.querySelector('[name="precio"]')?.value
      || document.querySelector("#precio")?.value
      || document.querySelector('[name="precio_por_noche"]')?.value
      || 0
    );

    const cover_image_url = (document.querySelector('[name="foto"]')?.value
      || document.querySelector("#foto")?.value
      || document.querySelector('[name="imagen"]')?.value
      || "").trim();

    try {
      const created = await api("/listings", {
        method: "POST",
        body: { title, description, province, city, capacity, price_per_night, cover_image_url }
      });

      alert("¡Alojamiento publicado!");
      location.href = `detalle.html?id=${created.id}`;
    } catch (err) {
      alert(err.message);
    }
  });
});
