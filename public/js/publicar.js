import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      alert("Tenés que iniciar sesión para publicar.");
      location.href = "login.html";
      return;
    }

    const form = document.querySelector("form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const titulo = (
        document.querySelector('[name="titulo"]')?.value ||
        document.querySelector("#titulo")?.value ||
        document.querySelector('[name="nombre"]')?.value ||
        ""
      ).trim();

      const descripcion = (
        document.querySelector('[name="descripcion"]')?.value ||
        document.querySelector("#descripcion")?.value ||
        ""
      ).trim();

      const provincia = (
        document.querySelector('[name="provincia"]')?.value ||
        document.querySelector("#provincia")?.value ||
        ""
      ).trim();

      const ciudad = (
        document.querySelector('[name="ciudad"]')?.value ||
        document.querySelector("#ciudad")?.value ||
        ""
      ).trim();

      const capacidad = Number(
        document.querySelector('[name="capacidad"]')?.value ||
        document.querySelector("#capacidad")?.value ||
        1
      );

      const precio = Number(
        document.querySelector('[name="precio"]')?.value ||
        document.querySelector("#precio")?.value ||
        document.querySelector('[name="precio_por_noche"]')?.value ||
        0
      );

      const foto = (
        document.querySelector('[name="foto"]')?.value ||
        document.querySelector("#foto")?.value ||
        document.querySelector('[name="imagen"]')?.value ||
        ""
      ).trim();

      if (!titulo || !descripcion || !provincia || !ciudad || !precio) {
        alert("Completá los campos obligatorios.");
        return;
      }

      try {
        const docRef = await addDoc(collection(db, "alojamientos"), {
          titulo,
          descripcion,
          provincia,
          ciudad,
          capacidad,
          precio,
          fotos: foto ? [foto] : [],
          anfitrionId: user.uid,
          anfitrionEmail: user.email || "",
          createdAt: serverTimestamp()
        });

        alert("¡Alojamiento publicado con éxito!");
        location.href = `detalle.html?id=${docRef.id}`;
      } catch (error) {
        console.error("Error al publicar:", error);
        alert("Hubo un error al publicar el alojamiento.");
      }
    });
  });
});
