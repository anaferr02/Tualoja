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

  // Cerrar al clickear un link dentro del nav
  nav.addEventListener("click", (e) => {
    if (e.target && e.target.tagName === "A") {
      closeNav();
    }
  });

  // Cerrar si se hace click fuera
  document.addEventListener("click", (e) => {
    const clickedInside = nav.contains(e.target) || btn.contains(e.target);
    if (!clickedInside) closeNav();
  });

  // Reset si se agranda la pantalla
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) closeNav();
  });
}

/* =========================
   MENÚ DE USUARIO (AUTH)
========================= */
async function setupUserMenu() {
  await refreshMe();
  const user = getUser();

  const userMenu = document.getElementById("userMenu");
  const userDropdown = document.getElementById("userDropdown");

  // Si la página no tiene menú de usuario, no hacemos nada
  if (!userMenu || !userDropdown) return;

  if (user) {
    // 🔐 USUARIO LOGUEADO
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
    // 👤 USUARIO NO LOGUEADO
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

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  setupHamburgerMenu();
  await setupUserMenu();
});
