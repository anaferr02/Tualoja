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
