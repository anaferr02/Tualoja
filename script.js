document.getElementById("searchForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // Opcional: podrías guardar los datos en localStorage si luego querés usarlos
  const destino = e.target.destino.value;
  const entrada = e.target.entrada.value;
  const salida = e.target.salida.value;
  const personas = e.target.personas.value;

  // Podés guardar los datos para usarlos en otra página (opcional)
  localStorage.setItem("destino", destino);
  localStorage.setItem("entrada", entrada);
  localStorage.setItem("salida", salida);
  localStorage.setItem("personas", personas);

  // Redirigir a la página de resultados
  window.location.href = "resultados.html";
});
// Guardar idioma seleccionado en localStorage
const idiomaSelect = document.getElementById("idioma");
idiomaSelect.addEventListener("change", () => {
  localStorage.setItem("idioma", idiomaSelect.value);
});
// Al cargar, seleccionar el idioma guardado
window.addEventListener("DOMContentLoaded", () => {
  const idiomaGuardado = localStorage.getItem("idioma");
  if (idiomaGuardado) {
    idiomaSelect.value = idiomaGuardado;
  }
});
// ===== MENU DINÁMICO (login / logout) =====
function renderAuthMenu() {
  const navAuth = document.getElementById("navAuth");
  if (!navAuth) return;

  const user = localStorage.getItem("loggedUser");

  if (user) {
    cconst nombre = user.split("@")[0];
const nombreCorto = nombre.length > 10 ? nombre.slice(0,10) + "…" : nombre;
    
    navAuth.innerHTML = `
      <span style="margin-right:12px; font-weight:700;">
        Hola, ${nombre}
      </span>
      <a href="#" id="logoutLink">Cerrar sesión</a>
    `;

    const logout = document.getElementById("logoutLink");
    if (logout) {
      logout.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("loggedUser");
        window.location.href = "index.html";
      });
    }

  } else {
    navAuth.innerHTML = `
      <a href="login.html">Iniciar sesión</a>
      <a href="register.html">Hazte una cuenta</a>
    `;
  }
}

document.addEventListener("DOMContentLoaded", renderAuthMenu);
