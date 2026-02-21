function renderAuthMenu() {
  const navAuth = document.getElementById("navAuth");
  if (!navAuth) return;

  const user = localStorage.getItem("loggedUser");

  if (user) {
    const nombre = user.split("@")[0];
    const nombreCorto = nombre.length > 10 ? nombre.slice(0, 10) + "…" : nombre;

    navAuth.innerHTML = `
      <span style="display:block; margin-bottom:8px; font-weight:700; text-align:center;">
        Hola, ${nombreCorto}
      </span>
      <a href="#" id="logoutLink" style="display:block; text-align:center;">Cerrar sesión</a>
    `;

    document.getElementById("logoutLink")?.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("loggedUser");
      window.location.href = "index.html";
    });
  } else {
    navAuth.innerHTML = `
      <a href="login.html" style="display:block; text-align:center;">Iniciar sesión</a>
      <a href="register.html" style="display:block; text-align:center;">Hazte una cuenta</a>
    `;
  }
}

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
