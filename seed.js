// seed.js
import { getAlojamientos, saveAlojamientos } from "./storage.js";

(function seedOnce() {
  const list = getAlojamientos();
  if (list.length) return;

  saveAlojamientos([
    {
      id: "demo_1",
      titulo: "Cabaña tranquila con parrilla",
      tipo: "Cabaña",
      capacidad: 4,
      descripcion: "Ideal para descansar. Cerca del centro.",
      provincia: "Entre Ríos",
      ciudad: "Villa Elisa",
      zona: "Zona tranquila",
      servicios: ["WiFi", "Parrilla", "Cochera"],
      precio: 35000,
      minimoNoches: 2,
      anfitrionNombre: "Anfitrión Demo",
      anfitrionWhatsapp: "5493447000000",
      anfitrionEmail: "demo@tualoja.com",
      fotos: [] // sin fotos (igual lista)
    }
  ]);
})();
