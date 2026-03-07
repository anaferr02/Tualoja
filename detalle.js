import { getAlojamientoById } from "./storage.js";

function getId() {
  const u = new URL(window.location.href);
  return u.searchParams.get("id");
}

function moneyARS(n) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(Number(n) || 0);
}

function crearCodigoReserva(){
  return "R" + Math.floor(Math.random()*900000+100000);
}

function getReservas(){
  try{
    return JSON.parse(localStorage.getItem("tualoja_bookings") || "[]");
  }catch{
    return [];
  }
}

function calcularNoches(inicio, fin){
  const d1 = new Date(inicio);
  const d2 = new Date(fin);
  const diff = d2 - d1;
  return diff/(1000*60*60*24);
}

(function(){

const id = getId();
const a = getAlojamientoById(id);

const wrap = document.getElementById("detalleWrap");

if(!a){
wrap.innerHTML = "Alojamiento no encontrado";
return;
}

const precio = Number(a.precio || 0);
const capacidad = Number(a.capacidad || 1);

wrap.innerHTML = `

<h1>${a.titulo}</h1>

<p>${a.ciudad || ""} ${a.provincia || ""}</p>

<div class="detalle-reserva-form">

<label class="detalle-label">Check-in</label>
<input class="detalle-input" type="date" id="checkin">

<label class="detalle-label">Check-out</label>
<input class="detalle-input" type="date" id="checkout">

<label class="detalle-label">Huéspedes</label>
<input class="detalle-input" type="number" id="guests" min="1" max="${capacidad}" value="1">

<div class="detalle-total-box">
Total estimado:
<strong id="totalPrecio">${moneyARS(precio)}</strong>
</div>

<button class="detalle-btn-reservar" id="btnReservar">
Reservar
</button>

</div>

`;

const checkin = document.getElementById("checkin");
const checkout = document.getElementById("checkout");
const guests = document.getElementById("guests");
const totalBox = document.getElementById("totalPrecio");

function actualizarPrecio(){

const c1 = checkin.value;
const c2 = checkout.value;

if(!c1 || !c2){
totalBox.textContent = moneyARS(precio);
return;
}

const noches = calcularNoches(c1,c2);

if(noches <= 0){
totalBox.textContent = moneyARS(precio);
return;
}

totalBox.textContent = moneyARS(noches*precio) + " (" + noches + " noches)";
}

checkin.addEventListener("change", actualizarPrecio);
checkout.addEventListener("change", actualizarPrecio);

document.getElementById("btnReservar").addEventListener("click", ()=>{

if(localStorage.getItem("tualoja_logged") !== "1"){
alert("Tenés que iniciar sesión para reservar");
location.href = "login.html";
return;
}

const c1 = checkin.value;
const c2 = checkout.value;

if(!c1 || !c2){
alert("Elegí fechas");
return;
}

const noches = calcularNoches(c1,c2);

if(noches <= 0){
alert("Las fechas no son válidas");
return;
}

const user = JSON.parse(localStorage.getItem("tualoja_user") || "{}");

const reservas = getReservas();

const nuevaReserva = {

id: Date.now(),

listingId: a.id,

title: a.titulo,

location: a.ciudad + " " + (a.provincia || ""),

cover: a.fotos ? a.fotos[0] : "",

guestName: user.name,

guestEmail: user.email,

hostEmail: a.email || "",

checkin: c1,

checkout: c2,

guests: guests.value,

total: noches*precio,

status: "pendiente",

code: crearCodigoReserva()

};

reservas.push(nuevaReserva);

localStorage.setItem("tualoja_bookings", JSON.stringify(reservas));

alert("Reserva creada");

location.href = "mis-reservas.html";

});

})();
