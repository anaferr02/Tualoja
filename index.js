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
  import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let alojamientos = [];

async function cargarAlojamientos() {
  const querySnapshot = await getDocs(collection(db, "alojamientos"));
  
  alojamientos = querySnapshot.docs.map(doc => doc.data());
}

cargarAlojamientos();
  const buscador = document.getElementById("buscador");
const sugerencias = document.getElementById("sugerencias");

buscador.addEventListener("input", () => {
  const valor = buscador.value.toLowerCase();
  sugerencias.innerHTML = "";

  if (valor.length < 2) return; // evita que busque con 1 letra

  // Filtrar por ciudad o dirección
  const resultados = alojamientos.filter(a =>
    a.ciudad?.toLowerCase().includes(valor) ||
    a.direccion?.toLowerCase().includes(valor)
  );

  // Limitar a 5 resultados
  resultados.slice(0, 5).forEach(a => {
    const div = document.createElement("div");
    div.classList.add("sugerencia");

    div.innerHTML = `
      <strong>${a.ciudad || "Sin ciudad"}</strong><br>
      <small>${a.direccion || ""}</small>
    `;

    div.addEventListener("click", () => {
      buscador.value = a.ciudad;
      sugerencias.innerHTML = "";
    });

    sugerencias.appendChild(div);
  });
});
});
