const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;

// Permitir servir archivos estáticos
app.use(express.static("public"));
app.use(express.json());

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Ruta para buscar alojamientos por destino
app.post("/buscar", (req, res) => {
  const destino = req.body.destino.toLowerCase();

  fs.readFile("alojamientos.json", (err, data) => {
    if (err) return res.status(500).send("Error leyendo datos");

    const alojamientos = JSON.parse(data);
    const filtrados = alojamientos.filter((a) =>
      a.ubicacion.toLowerCase().includes(destino),
    );

    res.json(filtrados);
  });
});
import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

async function inicializarCarruselDestacados() {
  const contenedor = document.getElementById("alojamientosInspiracion");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");

  if (!contenedor) return;

  try {
    // 1. Traer todos los alojamientos guardados en la colección de Firestore
    const snapshot = await getDocs(collection(db, "alojamientos"));
    let lista = [];

    snapshot.forEach((doc) => {
      lista.push({ id: doc.id, ...doc.data() });
    });

    if (lista.length === 0) {
      contenedor.innerHTML = "<p>No hay alojamientos disponibles por el momento.</p>";
      return;
    }

    // 2. Mezclar aleatoriamente el listado para rotación en cada recarga
    const mezclados = lista.sort(() => 0.5 - Math.random());

    // 3. Renderizar las tarjetas de alojamientos dinámicos
    contenedor.innerHTML = mezclados.map(item => {
      // Buscar la foto portada o la primera foto disponible
      const fotoPortada = item.fotos?.find(f => f.isCover)?.url || item.fotos?.[0]?.url || 'https://via.placeholder.com/300x200?text=Sin+Imagen';
      const serviciosTexto = item.servicios ? item.servicios.slice(0, 3).join(" · ") : "";
      
      return `
        <div class="card-alojamiento" onclick="window.location.href='alojamiento.html?id=${item.id}'" style="min-width: 260px; max-width: 280px; flex: 0 0 auto; background: #fff; border-radius: 18px; overflow: hidden; border: 1px solid rgba(27,22,127,0.1); box-shadow: 0 8px 20px rgba(0,0,0,0.06); cursor: pointer; transition: transform 0.2s ease;">
          <img src="${fotoPortada}" alt="${item.titulo}" style="width: 100%; height: 180px; object-fit: cover;" />
          <div style="padding: 15px;">
            <h3 style="font-size: 16px; margin: 0 0 8px; color: #1b167f; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.titulo}</h3>
            <p style="font-weight: 800; color: #4f3dbb; margin: 0 0 6px;">$${Number(item.precio).toLocaleString('es-AR')} / noche</p>
            <p style="font-size: 12px; color: #667085; margin: 0 0 8px;">${item.capacidad || 1} personas ${serviciosTexto ? '· ' + serviciosTexto : ''}</p>
            ${item.descripcion ? `<p style="font-size: 12px; color: #5b6472; font-style: italic; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">"${item.descripcion}"</p>` : ''}
          </div>
        </div>
      `;
    }).join("");

    // 4. Lógica de desplazamiento para las flechas del carrusel
    if (btnPrev && btnNext) {
      btnPrev.addEventListener("click", () => {
        contenedor.scrollBy({ left: -300, behavior: "smooth" });
      });

      btnNext.addEventListener("click", () => {
        contenedor.scrollBy({ left: 300, behavior: "smooth" });
      });
    }

  } catch (error) {
    console.error("Error al cargar alojamientos destacados:", error);
  }
}

// Cargar automáticamente cuando el DOM esté listo
window.addEventListener("DOMContentLoaded", inicializarCarruselDestacados);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
