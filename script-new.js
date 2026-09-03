// Configuración de JSONBin.io con tus claves
const BIN_ID = "6a994acdf5f4af5e2964e2e4";
const MASTER_KEY = "$2a$10$L3EwXJA5bVnItMjuEeGuiO2i0UvTltIS2YGBm7VsUVY8st/yX66lW";

// Tabla / Sistema de Tierlist de Puntos
const PUNTOS_TIERLIST = {
  "Extreme Demon": 100,
  "Insane Demon": 75,
  "Hard Demon": 50,
  "Medium Demon": 25,
  "Easy Demon": 10
};

// Cálculo de puntos por nivel
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

// Cargar niveles desde JSONBin.io (Nube)
async function cargarNiveles() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: {
        "X-Master-Key": MASTER_KEY,
        "X-Bin-Meta": "false"
      }
    });

    if (!response.ok) throw new Error("Error al cargar datos desde la nube");

    todosLosNiveles = await response.json();

    renderizarTablaNiveles(todosLosNiveles);
    renderizarRankingJugadores(todosLosNiveles);
  } catch (error) {
    console.error("Error en JSONBin:", error);
  }
}

// Guardar lista actualizada en la nube de JSONBin.io
async function guardarEnNube(nuevaLista) {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": MASTER_KEY
      },
      body: JSON.stringify(nuevaLista)
    });

    if (!response.ok) throw new Error("No se pudo guardar en la nube");
    
    console.log("¡Guardado correctamente en la nube!");
  } catch (error) {
    console.error("Error guardando en la nube:", error);
    alert("Hubo un error guardando el nivel en la nube.");
  }
}

// 1. Renderizar la Tabla de Niveles
function renderizarTablaNiveles(niveles) {
  const tbody = document.getElementById("lista-niveles");
  if (!tbody) return;

  tbody.innerHTML = "";

  niveles.forEach((nivel, index) => {
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

// 2. Calcular y Renderizar el Ranking de Jugadores
function renderizarRankingJugadores(niveles) {
  const tbodyJugadores = document.getElementById("lista-jugadores");
  if (!tbodyJugadores) return;

  const jugadoresMap = {};

  niveles.forEach(nivel => {
    const dificultad = nivel.difficulty || nivel.dificultad || "Easy Demon";
    const progreso = nivel.progress !== undefined ? nivel.progress : (nivel.progreso !== undefined ? nivel.progreso : 100);
    const puntosNivel = nivel.puntos !== undefined ? nivel.puntos : calcularPuntos(dificultad, progreso);
    const jugadores = nivel.players || nivel.jugadores || [];

    const lista = Array.isArray(jugadores) 
      ? jugadores 
      : (typeof jugadores === 'string' ? jugadores.split(",").map(j => j.trim()) : []);

    lista.forEach(jugadorNombre => {
      const nombreLimpio = jugadorNombre.trim();
      if (!nombreLimpio) return;

      if (!jugadoresMap[nombreLimpio]) {
        jugadoresMap[nombreLimpio] = {
          nombre: nombreLimpio,
          puntosTotales: 0,
          nivelesCompletados: 0
        };
      }

      jugadoresMap[nombreLimpio].puntosTotales += puntosNivel;
      jugadoresMap[nombreLimpio].nivelesCompletados += 1;
    });
  });

  const rankingOrdenado = Object.values(jugadoresMap).sort((a, b) => b.puntosTotales - a.puntosTotales);

  tbodyJugadores.innerHTML = "";

  rankingOrdenado.forEach((jugador, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>#${index + 1}</strong></td>
      <td><strong style="color: #fff;">${jugador.nombre}</strong></td>
      <td>${jugador.nivelesCompletados} nivel(es)</td>
      <td><strong style="color: #00e5ff;">${jugador.puntosTotales} pts</strong></td>
    `;
    tbodyJugadores.appendChild(tr);
  });
}

// Filtros de búsqueda
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

    renderizarTablaNiveles(filtrados);
  }

  if (inputBuscar) inputBuscar.addEventListener("input", aplicarFiltros);
  if (selectFiltro) selectFiltro.addEventListener("change", aplicarFiltros);
}

// Formulario para añadir nivel con desplazamiento de posiciones
function configurarFormulario() {
  const form = document.getElementById("form-nivel");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const posInput = parseInt(document.getElementById("posicion").value);
    // Si no pones posición, se coloca al final automáticamente
    const posTarget = (!isNaN(posInput) && posInput > 0) ? posInput : (todosLosNiveles.length + 1);

    // 🔄 DESPLAZAMIENTO AUTOMÁTICO:
    // Si ya existe un nivel en esa posición o más abajo, les suma +1 a su posición.
    todosLosNiveles.forEach(nivel => {
      const posActual = nivel.position || nivel.posicion || 0;
      if (posActual >= posTarget) {
        if (nivel.position !== undefined) nivel.position = posActual + 1;
        if (nivel.posicion !== undefined) nivel.posicion = posActual + 1;
      }
    });

    const nuevoNivel = {
      name: document.getElementById("nombre").value,
      creator: document.getElementById("creador").value,
      difficulty: document.getElementById("dificultad").value,
      progress: parseInt(document.getElementById("progreso").value) || 100,
      position: posTarget,
      players: document.getElementById("jugadores").value.split(",").map(j => j.trim()).filter(j => j !== "")
    };

    todosLosNiveles.push(nuevoNivel);
    // Reordenamos la lista completa por posición
    todosLosNiveles.sort((a, b) => (a.position || a.posicion) - (b.position || b.posicion));
    
    // 1. Renderizar en pantalla los cambios inmediatamente
    renderizarTablaNiveles(todosLosNiveles);
    renderizarRankingJugadores(todosLosNiveles);
    
    // 2. Guardar la nueva lista reordenada en la nube
    await guardarEnNube(todosLosNiveles);
    
    form.reset();
  });
}
