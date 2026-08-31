import { refreshMe, getUser, logout } from "./public/js/auth.js";
import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";



async function inicializarCarruselDestacados() {
  const contenedor = document.getElementById("alojamientosInspiracion");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");

  if (!contenedor) return;

  try {
    // 1. Traer todos los alojamientos guardados en la colección de Firestore
    const snapshot = await getDocs(collection(db, "alojamientos"));
    let lista = [];

    snapshot.forEach((doc) => {
      lista.push({ id: doc.id, ...doc.data() });
    });

    if (lista.length === 0) {
      contenedor.innerHTML = "<p style='padding:20px; text-align:center;'>No hay alojamientos disponibles por el momento.</p>";
      return;
    }

    // 2. Mezclar aleatoriamente el listado para rotación en cada recarga
    const mezclados = lista.sort(() => 0.5 - Math.random());

    // 3. Renderizar las tarjetas de alojamientos dinámicos
    contenedor.innerHTML = mezclados.map(item => {
      const fotoPortada = item.fotos?.find(f => f.isCover)?.url || item.fotos?.[0]?.url || 'https://via.placeholder.com/300x200?text=Sin+Imagen';
      const serviciosTexto = item.servicios ? item.servicios.slice(0, 3).join(" · ") : "";
      
      return `
        <div class="card-alojamiento" onclick="window.location.href='alojamiento.html?id=${item.id}'" style="min-width: 260px; max-width: 280px; flex: 0 0 auto; background: #fff; border-radius: 18px; overflow: hidden; border: 1px solid rgba(27,22,127,0.1); box-shadow: 0 8px 20px rgba(0,0,0,0.06); cursor: pointer; transition: transform 0.2s ease;">
          <img src="${fotoPortada}" alt="${item.titulo || 'Alojamiento'}" style="width: 100%; height: 180px; object-fit: cover;" />
          <div style="padding: 15px;">
            <h3 style="font-size: 16px; margin: 0 0 8px; color: #1b167f; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.titulo || 'Sin título'}</h3>
            <p style="font-weight: 800; color: #4f3dbb; margin: 0 0 6px;">$${Number(item.precio || 0).toLocaleString('es-AR')} / noche</p>
            <p style="font-size: 12px; color: #667085; margin: 0 0 8px;">${item.capacidad || 1} personas ${serviciosTexto ? '· ' + serviciosTexto : ''}</p>
            ${item.descripcion ? `<p style="font-size: 12px; color: #5b6472; font-style: italic; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">"${item.descripcion}"</p>` : ''}
          </div>
        </div>
      `;
    }).join("");

    // 4. Lógica de desplazamiento para las flechas del carrusel
    if (btnPrev && btnNext) {
      const newBtnPrev = btnPrev.cloneNode(true);
      const newBtnNext = btnNext.cloneNode(true);
      btnPrev.parentNode.replaceChild(newBtnPrev, btnPrev);
      btnNext.parentNode.replaceChild(newBtnNext, btnNext);

      newBtnPrev.addEventListener("click", () => {
        contenedor.scrollBy({ left: -300, behavior: "smooth" });
      });

      newBtnNext.addEventListener("click", () => {
        contenedor.scrollBy({ left: 300, behavior: "smooth" });
      });
    }

  } catch (error) {
    console.error("Error al cargar alojamientos destacados:", error);
    if (contenedor) {
      contenedor.innerHTML = "<p style='padding:20px; color:red; text-align:center;'>Error al cargar el carrusel de alojamientos.</p>";
    }
  }
}

// Cargar automáticamente cuando el DOM esté listo
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", inicializarCarruselDestacados);
} else {
  inicializarCarruselDestacados();
}

function setupHamburgerMenu() {
  const btn = document.getElementById("hamburgerBtn");
  const nav = document.getElementById("mainNav");

  if (!btn || !nav) return;

  const closeNav = () => nav.classList.remove("is-open");
  const toggleNav = () => nav.classList.toggle("is-open");

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleNav();
  });

  nav.addEventListener("click", (e) => {
    e.stopPropagation();
    if (e.target && e.target.tagName === "A") {
      closeNav();
    }
  });

  document.addEventListener("click", (e) => {
    const clickedInside = nav.contains(e.target) || btn.contains(e.target);
    if (!clickedInside) closeNav();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) closeNav();
  });
}

function bindLogoutButton(buttonId) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;

  btn.addEventListener("click", async (e) => {
    e.preventDefault();

    try {
      await logout();
      window.location.href = "index.html";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("No se pudo cerrar sesión. Intentá de nuevo.");
    }
  });
}

function renderAuthArea(user) {
  const authArea = document.getElementById("authArea");
  if (!authArea) return;

  if (user) {
    authArea.innerHTML = `
      <a class="btn btn-primary" href="mi-cuenta.html">Cuenta</a>
      <a class="btn btn-ghost" href="#" id="logoutBtnAuthArea">Salir</a>
    `;

    bindLogoutButton("logoutBtnAuthArea");
  } else {
    authArea.innerHTML = `
      <a class="btn btn-ghost" href="login.html">Iniciar sesión</a>
      <a class="btn btn-primary" href="register.html">Hazte una cuenta</a>
    `;
  }
}

function renderUserMenu(user) {
  const userMenu = document.getElementById("userMenu");
  const userDropdown = document.getElementById("userDropdown");

  if (!userMenu || !userDropdown) return;

  if (user) {
    userMenu.textContent = user.name || "Mi cuenta";

    userDropdown.innerHTML = `
      <a href="mi-cuenta.html">Mi cuenta</a>
      <a href="mis-reservas.html">Mis reservas</a>
      <a href="publicar.html">Publicar alojamiento</a>
      <a href="panel-anfitrion.html">Panel anfitrión</a>
      <a href="#" id="logoutBtn">Cerrar sesión</a>
    `;

    bindLogoutButton("logoutBtn");
  } else {
    userMenu.textContent = "Cuenta";

    userDropdown.innerHTML = `
      <a href="login.html">Iniciar sesión</a>
      <a href="register.html">Registrarse</a>
      <a href="recuperar.html" style="font-size:13px; opacity:.85;">
        ¿Olvidaste tu contraseña?
      </a>
    `;
  }
}

async function setupAuthUI() {
  try {
    await refreshMe();
    const user = getUser();
    renderAuthArea(user);
    renderUserMenu(user);
  } catch (error) {
    console.error("Error al cargar sesión:", error);
    renderAuthArea(null);
    renderUserMenu(null);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  setupHamburgerMenu();
  await setupAuthUI();
});
