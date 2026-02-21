// ===== SEARCH FORM (solo si existe) =====
const searchForm = document.getElementById("searchForm");
if (searchForm) {
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const destino = e.target.destino?.value || "";
    const entrada = e.target.entrada?.value || "";
    const salida = e.target.salida?.value || "";
    const personas = e.target.personas?.value || "";

    localStorage.setItem("destino", destino);
    localStorage.setItem("entrada", entrada);
    localStorage.setItem("salida", salida);
    localStorage.setItem("personas", personas);

    window.location.href = "resultados.html";
  });
}

// ===== IDIOMA (solo si existe) =====
const idiomaSelect = document.getElementById("idioma");
if (idiomaSelect) {
  idiomaSelect.addEventListener("change", () => {
    localStorage.setItem("idioma", idiomaSelect.value);
  });

  window.addEventListener("DOMContentLoaded", () => {
    const idiomaGuardado = localStorage.getItem("idioma");
    if (idiomaGuardado) {
      idiomaSelect.value = idiomaGuardado;
    }
  });
}

// ===== MENU DINÁMICO (login / logout) =====
// REEMPLAZÁ renderAuthMenu EN script.js POR ESTE (COPIÁ TAL CUAL)

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
      <a href="#" id="logoutLink">Cerrar sesión</a>
    `;

    document.getElementById("logoutLink")?.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("loggedUser");
      window.location.href = "index.html";
    });
  } else {
    navAuth.innerHTML = `
      <a href="login.html">Iniciar sesión</a>
      <a href="register.html">Hazte una cuenta</a>
    `;
  }
}

// ===== MENU HAMBURGUESA =====
function initHamburgerMenu() {
  const btn = document.getElementById("hamburgerBtn");
  const nav = document.getElementById("mainNav");
  if (!btn || !nav) return;

  btn.onclick = () => {
    nav.classList.toggle("is-open");
    btn.textContent = nav.classList.contains("is-open") ? "✕" : "☰";
  };
}

document.addEventListener("DOMContentLoaded", initHamburgerMenu);
