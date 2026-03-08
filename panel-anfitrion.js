import { getAlojamientos } from "./storage.js";

const cont = document.getElementById("misAlojamientos");

const alojamientos = getAlojamientos();

cont.innerHTML = alojamientos.map(a => `

<div>

<img src="${a.foto}" width="150">

<h3>${a.titulo}</h3>

<p>${a.ciudad}</p>

<p>$${a.precio}</p>

</div>

`).join("");
