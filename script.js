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

/* =========================
   AUTH UI
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
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await logout();
        } catch (error) {
          console.error("Error al cerrar sesión:", error);
          alert("No se pudo cerrar sesión.");
        }
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
    userMenu.innerHTML = `${user.name || "Mi cuenta"}`;

    userDropdown.innerHTML = `
      <a href="mis-reservas.html">Mis reservas</a>
      <a href="publicar.html">Publicar alojamiento</a>
      <a href="panel-anfitrion.html">Panel anfitrión</a>
      <a href="#" id="logoutBtn">Cerrar sesión</a>
    `;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await logout();
        } catch (error) {
          console.error("Error al cerrar sesión:", error);
          alert("No se pudo cerrar sesión.");
        }
      });
    }
  } else {
    userMenu.innerHTML = `Cuenta`;

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

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  setupHamburgerMenu();
  await setupAuthUI();
});
