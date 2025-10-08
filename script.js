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
