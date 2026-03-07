// publicar.js

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

      if (hint) {
        hint.textContent = fotosData.length
          ? `Cargaste ${fotosData.length} foto(s).`
          : "Todavía no cargaste fotos.";
      }

      if (preview) {
        preview.innerHTML = fotosData
          .map((src) => `<img class="preview-img" src="${src}">`)
          .join("");
      }
    });
  }

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (fotosData.length < 3) {
      if (msg) msg.textContent = "Tenés que subir al menos 3 fotos.";
      return;
    }

    const servicios = Array.from(
      document.querySelectorAll(".serv:checked")
    ).map((x) => x.value);

    const alojamiento = {
      titulo: document.getElementById("titulo").value,
      tipo: document.getElementById("tipo").value,
      capacidad: Number(document.getElementById("capacidad").value),
      descripcion: document.getElementById("descripcion").value,
      provincia: document.getElementById("provincia").value,
      ciudad: document.getElementById("ciudad").value,
      zona: document.getElementById("zona").value,
      servicios,
      fotos: fotosData,
      precio: Number(document.getElementById("precio").value),
      minimoNoches: Number(document.getElementById("minNoches").value)
    };

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(alojamiento)
      });

      if (!res.ok) throw new Error("Error al publicar");

      if (msg) msg.textContent = "✅ Publicado correctamente";

      setTimeout(() => {
        window.location.href = "resultados.html";
      }, 800);

    } catch (err) {
      console.error(err);
      if (msg) msg.textContent = "❌ Error al publicar el alojamiento";
    }
  });
})();
