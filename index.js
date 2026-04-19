const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Servir archivos de la carpeta public
app.use(express.static("public"));
app.use(express.json());

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Buscar alojamientos
app.post("/buscar", (req, res) => {
  const destino = (req.body.destino || "").toLowerCase();

  fs.readFile("alojamientos.json", (err, data) => {
    if (err) return res.status(500).send("Error leyendo datos");

    const alojamientos = JSON.parse(data);

    const filtrados = alojamientos.filter(a =>
      a.ubicacion.toLowerCase().includes(destino)
    );

    res.json(filtrados);
  });
});

// Levantar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCj82nKioRzTYQJPMUme0yFCXDKivVc_g",
  authDomain: "tualoja-5210e.firebaseapp.com",
  projectId: "tualoja-5210e",
  storageBucket: "tualoja-5210e.firebasestorage.app",
  messagingSenderId: "472294290866",
  appId: "1:472294290866:web:7bc5d811c4c63bea9660ab"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let alojamientos = [];

async function cargarAlojamientos() {
  const snapshot = await getDocs(collection(db, "alojamientos"));
  alojamientos = snapshot.docs.map(doc => doc.data());
}

cargarAlojamientos();

const buscador = document.getElementById("buscador");
const sugerencias = document.getElementById("sugerencias");

buscador.addEventListener("input", () => {
  const valor = buscador.value.toLowerCase();
  sugerencias.innerHTML = "";

  if (valor.length < 2) return;

  const resultados = alojamientos.filter(a =>
    a.ciudad?.toLowerCase().includes(valor) ||
    a.direccion?.toLowerCase().includes(valor)
  );

  resultados.slice(0,5).forEach(a => {
    const div = document.createElement("div");
    div.classList.add("sugerencia");

    div.innerHTML = `
      <strong>${a.ciudad || "Sin ciudad"}</strong><br>
      <small>${a.direccion || ""}</small>
    `;

    div.onclick = () => {
      buscador.value = a.ciudad;
      sugerencias.innerHTML = "";
    };

    sugerencias.appendChild(div);
  });
});
