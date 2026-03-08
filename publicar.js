import { addAlojamiento, uid } from "./storage.js";

const form = document.getElementById("formPublicar");

form.addEventListener("submit", function(e){

e.preventDefault();

const alojamiento = {

id: uid(),
titulo: document.getElementById("titulo").value,
ciudad: document.getElementById("ciudad").value,
provincia: document.getElementById("provincia").value,
precio: document.getElementById("precio").value,
foto: document.getElementById("foto").value,
lat: document.getElementById("lat").value,
lng: document.getElementById("lng").value

};

addAlojamiento(alojamiento);

alert("Alojamiento publicado");

window.location.href="panel-anfitrion.html";

});
