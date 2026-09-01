// Tabla / Sistema de Tierlist de Puntos
const PUNTOS_TIERLIST = {
  "Extreme Demon": 100,
  "Insane Demon": 75,
  "Hard Demon": 50,
  "Medium Demon": 25,
  "Easy Demon": 10
};

// Cálculo de puntos según dificultad y % de progreso
function calcularPuntos(dificultad, progreso) {
  const puntosBase = PUNTOS_TIERLIST[dificultad] || 0;
  const porcentaje = parseFloat(progreso) || 100;
  return Math.round((porcentaje / 100) * puntosBase);
}

let todosLosNiveles = [];

document.addEventListener("DOMContentLoaded", () => {
  cargarNiveles();
  configurarFiltros();
  configurarFormulario();
});

// Cargar niveles desde level-new.json
async function cargarNiveles() {
  try {
    const response = await fetch('./level-new.json?v=' + Date.now());
    if (!response.ok) throw new Error("No se pudo cargar el archivo JSON");
    
    todosLosNiveles = await response.json();
    renderizarTabla(todosLosNiveles);
  } catch (error) {
    console.error("Error cargando los niveles:", error);
  }
}

// Renderizar la tabla (Soporta claves en inglés y español)
function renderizarTabla(niveles) {
  const tbody = document.getElementById("lista-niveles");
  if (!tbody) return;

  tbody.innerHTML = "";

  niveles.forEach((nivel, index) => {
    // Compatibilidad de nombres de propiedades (Inglés / Español)
    const nombre = nivel.name || nivel.nombre || "Sin nombre";
    const creador = nivel.creator || nivel.creador || "Desconocido";
    const dificultad = nivel.difficulty || nivel.dificultad || "Easy Demon";
    const progreso = nivel.progress !== undefined ? nivel.progress : (nivel.progreso !== undefined ? nivel.progreso : 100);
    const posicion = nivel.position || nivel.posicion || (index + 1);
    const jugadores = nivel.players || nivel.jugadores || [];

    const puntos = nivel.puntos !== undefined 
      ? nivel.puntos 
      : calcularPuntos(dificultad, progreso);

    const listaJugadores = Array.isArray(jugadores) ? jugadores.join(", ") : jugadores;
    const claseBadge = dificultad.toLowerCase().replace(/\s+/g, '-');

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${posicion}</td>
      <td><strong>${nombre}</strong></td>
      <td>${creador}</td>
      <td><span class="badge ${claseBadge}">${dificultad}</span></td>
      <td>${progreso}%</td>
      <td>${listaJugadores}</td>
      <td><strong style="color: #00e5ff;">+${puntos} pts</strong></td>
    `;
    tbody.appendChild(tr);
  });
}

// Lógica de búsqueda y filtro por dificultad
function configurarFiltros() {
  const inputBuscar = document.getElementById("buscar");
  const selectFiltro = document.getElementById("filtro-dificultad");

  function aplicarFiltros() {
    const textoBusqueda = inputBuscar ? inputBuscar.value.toLowerCase() : "";
    const dificultadSeleccionada = selectFiltro ? selectFiltro.value : "todas";

    const filtrados = todosLosNiveles.filter(nivel => {
      const nombre = (nivel.name || nivel.nombre || "").toLowerCase();
      const creador = (nivel.creator || nivel.creador || "").toLowerCase();
      const dificultad = nivel.difficulty || nivel.dificultad || "";

      const coincideTexto = nombre.includes(textoBusqueda) || creador.includes(textoBusqueda);
      const coincideDificultad = dificultadSeleccionada === "todas" || dificultad === dificultadSeleccionada;

      return coincideTexto && coincideDificultad;
    });

    renderizarTabla(filtrados);
  }

  if (inputBuscar) inputBuscar.addEventListener("input", aplicarFiltros);
  if (selectFiltro) selectFiltro.addEventListener("change", aplicarFiltros);
}

// Lógica para añadir nuevos niveles desde el formulario
function configurarFormulario() {
  const form = document.getElementById("form-nivel");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nuevoNivel = {
      name: document.getElementById("nombre").value,
      creator: document.getElementById("creador").value,
      difficulty: document.getElementById("dificultad").value,
      progress: parseInt(document.getElementById("progreso").value) || 100,
      position: parseInt(document.getElementById("posicion").value) || (todosLosNiveles.length + 1),
      players: document.getElementById("jugadores").value.split(",").map(j => j.trim()).filter(j => j !== "")
    };

    todosLosNiveles.push(nuevoNivel);
    todosLosNiveles.sort((a, b) => (a.position || a.posicion) - (b.position || b.posicion));
    renderizarTabla(todosLosNiveles);
    form.reset();
  });
}

