import { getAlojamientos } from "./storage.js";

const mapa = L.map('mapa').setView([-34.6, -58.4], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
 attribution:'© OpenStreetMap'
}).addTo(mapa);

const alojamientos = getAlojamientos();

alojamientos.forEach(a=>{

if(!a.lat || !a.lng) return;

L.marker([a.lat,a.lng])
.addTo(mapa)
.bindPopup(`
<b>${a.titulo}</b><br>
${a.ciudad}<br>
$${a.precio}
`);

});
