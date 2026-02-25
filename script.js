import { refreshMe, getUser, logout } from "./public/js/auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  await refreshMe();
  const user = getUser();

  const userMenu = document.getElementById("userMenu");
  const userDropdown = document.getElementById("userDropdown");

  if (!userMenu || !userDropdown) return;

  if (user) {
    userMenu.innerHTML = `<i class="fas fa-user"></i> ${user.name}`;
    userDropdown.innerHTML = `
      <a href="mis-reservas.html">Mis reservas</a>
      <a href="publicar.html">Publicar alojamiento</a>
      <a href="panel-anfitrion.html">Panel anfitrión</a>
      <a href="#" id="logoutBtn">Cerrar sesión</a>
    `;
    document.getElementById("logoutBtn").addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  } else {
    userMenu.innerHTML = `<i class="fas fa-user"></i> Cuenta`;
    userDropdown.innerHTML = `
      <a href="login.html">Iniciar sesión</a>
      <a href="register.html">Registrarse</a>
    `;
  }
});
