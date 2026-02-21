// ===== MENU DINÁMICO (login / logout) =====
function renderAuthMenu() {
  const navAuth = document.getElementById("navAuth");
  if (!navAuth) return;

  const user = localStorage.getItem("loggedUser");

  if (user) {
    const nombre = user.split("@")[0];
    const nombreCorto = nombre.length > 10 ? nombre.slice(0, 10) + "…" : nombre;

    navAuth.innerHTML = `
      <span class="hello">Hola, ${nombreCorto}</span>
      <a href="#" id="logoutLink" class="btn-nav">Cerrar sesión</a>
    `;

    document.getElementById("logoutLink")?.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("loggedUser");
      window.location.href = "index.html";
    });
  } else {
    navAuth.innerHTML = `
      <a href="login.html" class="btn-nav">Iniciar sesión</a>
      <a href="register.html" class="btn-nav">Hazte una cuenta</a>
    `;
  }
}

// ===== MENU HAMBURGUESA =====
function initHamburgerMenu() {
  const btn = document.getElementById("hamburgerBtn");
  const nav = document.getElementById("mainNav");
  if (!btn || !nav) return;

  btn.addEventListener("click", () => {
    nav.classList.toggle("is-open");
    btn.textContent = nav.classList.contains("is-open") ? "✕" : "☰";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderAuthMenu();
  initHamburgerMenu();
});
