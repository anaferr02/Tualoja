const tipoSelect = document.getElementById("tipo");
const datosPropietario = document.getElementById("datosPropietario");
const form = document.getElementById("registroForm");

tipoSelect.addEventListener("change", () => {
  if (tipoSelect.value === "propietario") {
    datosPropietario.style.display = "block";
  } else {
    datosPropietario.style.display = "none";
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const datos = Object.fromEntries(formData.entries());

  console.log("Datos de registro:", datos);

  alert("Registro enviado (simulado). Mirá la consola 👀");

  // Más adelante:
  // fetch(...)
});

