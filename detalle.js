import { getAlojamientos } from "./storage.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const alojamientos = getAlojamientos();

const alojamiento = alojamientos.find(a => a.id == id);

const cont = document.getElementById("detalle");

if(alojamiento){

cont.innerHTML = `

<h1>${alojamiento.titulo}</h1>

<img src="${alojamiento.foto}" width="400">

<p>${alojamiento.ciudad} - ${alojamiento.provincia}</p>

<p>$${alojamiento.precio} por noche</p>

`;

}
