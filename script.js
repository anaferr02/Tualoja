import { refreshMe, getUser, logout } from "./public/js/auth.js";

/* =========================
   HAMBURGUESA / NAV MOBILE
========================= */
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

  // Evita que clicks dentro del nav cierren por el listener global
  nav.addEventListener("click", (e) => {
    e.stopPropagation();

    // Cerrar al clickear un link dentro del nav
    if (e.target && e.target.tagName === "A") closeNav();
  });

  // Cerrar si se hace click fuera
  document.addEventListener("click", (e) => {
    const clickedInside = nav.contains(e.target) || btn.contains(e.target);
    if (!clickedInside) closeNav();
  });

  // Cerrar con ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  // Reset si se agranda la pantalla
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) closeNav();
  });
}

/* =========================
   AUTH UI (soporta 2 variantes)
   - Variante A: #userMenu + #userDropdown
   - Variante B: #authArea (como tu index)
========================= */
function renderAuthArea(user) {
  const authArea = document.getElementById("authArea");
  if (!authArea) return;

  if (user) {
    authArea.innerHTML = `
      <a class="btn btn-primary" href="mi-cuenta.html">Cuenta</a>
      <a class="btn btn-ghost" href="#" id="logoutBtnAuthArea">Salir</a>
    `;

    const btn = document.getElementById("logoutBtnAuthArea");
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        logout();
      });
    }
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
    userMenu.innerHTML = `<i class="fas fa-user"></i> ${user.name || "Mi cuenta"}`;

    userDropdown.innerHTML = `
      <a href="mis-reservas.html">Mis reservas</a>
      <a href="publicar.html">Publicar alojamiento</a>
      <a href="panel-anfitrion.html">Panel anfitrión</a>
      <a href="#" id="logoutBtn">Cerrar sesión</a>
    `;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        logout();
      });
    }
  } else {
    userMenu.innerHTML = `<i class="fas fa-user"></i> Cuenta`;

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
  await refreshMe();
  const user = getUser();

  // Actualiza la UI según lo que exista en esa página
  renderAuthArea(user);
  renderUserMenu(user);
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  setupHamburgerMenu();
  await setupAuthUI();
});
