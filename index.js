const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Permitir servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Ruta para buscar alojamientos por destino
app.post("/buscar", (req, res) => {
  const destino = req.body.destino ? req.body.destino.toLowerCase() : "";

  fs.readFile("alojamientos.json", "utf8", (err, data) => {
    if (err) return res.status(500).send("Error leyendo datos");

    try {
      const alojamientos = JSON.parse(data);
      const filtrados = alojamientos.filter((a) =>
        a.ubicacion && a.ubicacion.toLowerCase().includes(destino)
      );
      res.json(filtrados);
    } catch (parseErr) {
      res.status(500).send("Error en el formato de datos");
    }
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
