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
});
