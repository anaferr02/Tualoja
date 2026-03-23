import { db } from "./firebase-config.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

let map;

async function initMap() {

  map = new google.maps.Map(document.getElementById("mapaResultados"), {
    center: { lat: -34.6037, lng: -58.3816 }, // Buenos Aires base
    zoom: 5,
    mapTypeId: "satellite" // 🔥 SATELITAL
  });

  const snapshot = await getDocs(collection(db, "alojamientos"));

  snapshot.forEach((doc) => {
    const a = doc.data();

    // ⚠️ Necesitas guardar lat y lng en Firebase
    if (!a.lat || !a.lng) return;

    const marker = new google.maps.Marker({
      position: { lat: a.lat, lng: a.lng },
      map: map,
      title: a.titulo
    });

    const info = new google.maps.InfoWindow({
      content: `
        <div style="max-width:200px">
          <strong>${a.titulo}</strong><br>
          ${a.ciudad}<br>
          $${a.precio} / noche<br><br>
          <a href="detalle.html?id=${doc.id}">Ver</a>
        </div>
      `
    });

    marker.addListener("click", () => {
      info.open(map, marker);
    });
  });
}

window.onload = initMap;
