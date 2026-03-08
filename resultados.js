import { getAlojamientos } from "./storage.js";

const cont = document.getElementById("resultados");

const alojamientos = getAlojamientos();

cont.innerHTML = alojamientos.map(a => `

<div class="card">

<img src="${a.foto}" style="width:100%">

<h3>${a.titulo}</h3>

<p>${a.ciudad} - ${a.provincia}</p>

<p>$${a.precio} por noche</p>

<a href="detalle.html?id=${a.id}">Ver alojamiento</a>

</div>

`).join("");
