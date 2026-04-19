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
const buscador = document.getElementById("buscador");
const sugerencias = document.getElementById("sugerencias");

// Ejemplo de datos (después esto lo sacás de Firebase)
const destinos = [
  "Paraná",
  "Córdoba",
  "Buenos Aires",
  "Rosario",
  "Mendoza",
  "Bariloche"
];

buscador.addEventListener("input", () => {
  const valor = buscador.value.toLowerCase();
  sugerencias.innerHTML = "";

  if (valor === "") return;

  const resultados = destinos.filter(d =>
    d.toLowerCase().includes(valor)
  );

  resultados.forEach(r => {
    const div = document.createElement("div");
    div.classList.add("sugerencia");
    div.textContent = r;

    div.addEventListener("click", () => {
      buscador.value = r;
      sugerencias.innerHTML = "";
    });

    sugerencias.appendChild(div);
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
