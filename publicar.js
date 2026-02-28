// publicar.js
import { addAlojamiento, uid } from "./storage.js";

function readFilesAsDataURL(files) {
  const tasks = Array.from(files || []).map(
    (file) =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => resolve("");
        reader.readAsDataURL(file);
      })
  );
  return Promise.all(tasks).then((arr) => arr.filter(Boolean));
}

(function init() {
  const form = document.getElementById("formPublicar");
  const inputFotos = document.getElementById("fotos");
  const preview = document.getElementById("previewFotos");
  const hint = document.getElementById("fotosHint");
  const msg = document.getElementById("msg");

  let fotosData = [];

  if (inputFotos) {
    inputFotos.addEventListener("change", async () => {
      fotosData = await readFilesAsDataURL(inputFotos.files);
      if (hint) hint.textContent = fotosData.length ? `Cargaste ${fotosData.length} foto(s).` : "Todavía no cargaste fotos.";
      if (preview) {
        preview.innerHTML = fotosData
          .map((src) => `<img class="preview-img" src="${src}" alt="Foto">`)
          .join("");
      }
    });
  }

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (fotosData.length < 3) {
      if (msg) msg.textContent = "Tenés que subir al menos 3 fotos.";
      return;
    }

    const servicios = Array.from(document.querySelectorAll(".serv:checked")).map((x) => x.value);

    const aloj = {
      id: uid(),
      titulo: document.getElementById("titulo")?.value?.trim(),
      tipo: document.getElementById("tipo")?.value?.trim(),
      capacidad: Number(document.getElementById("capacidad")?.value || 0),
      descripcion: document.getElementById("descripcion")?.value?.trim(),
      provincia: document.getElementById("provincia")?.value?.trim(),
      ciudad: document.getElementById("ciudad")?.value?.trim(),
      zona: document.getElementById("zona")?.value?.trim(),
      servicios,
      fotos: fotosData,
      precio: Number(document.getElementById("precio")?.value || 0),
      minimoNoches: Number(document.getElementById("minNoches")?.value || 1),
      anfitrionNombre: document.getElementById("anfitrionNombre")?.value?.trim(),
      anfitrionWhatsapp: document.getElementById("anfitrionWhatsapp")?.value?.trim(),
      anfitrionEmail: document.getElementById("anfitrionEmail")?.value?.trim(),
      createdAt: new Date().toISOString()
    };

    addAlojamiento(aloj);

    if (msg) msg.textContent = "✅ Publicado. Te llevo a Resultados…";
    setTimeout(() => (window.location.href = "resultados.html"), 600);
  });
})();
