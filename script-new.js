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

let todosLosNiveles = [];
let modoEdicionActivo = false;

// Cálculo de puntos por nivel
function calcularPuntos(dificultad, progreso) {
  const puntosBase = PUNTOS_TIERLIST[dificultad] || 0;
  const porcentaje = parseFloat(progreso) || 100;
  return Math.round((porcentaje / 100) * puntosBase);
}

document.addEventListener("DOMContentLoaded", () => {
  cargarNiveles();
  configurarFiltros();
  configurarFormulario();
  configurarBotonModoEdicion();
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

// Botón arriba a la derecha para activar/desactivar la edición
function configurarBotonModoEdicion() {
  const btnModo = document.getElementById("btn-modo-edicion");
  if (!btnModo) return;

  btnModo.addEventListener("click", () => {
    modoEdicionActivo = !modoEdicionActivo;

    if (modoEdicionActivo) {
      btnModo.textContent = "✖️ Salir de Edición";
      btnModo.classList.add("activo");
    } else {
      btnModo.textContent = "⚙️ Modo Edición";
      btnModo.classList.remove("activo");
      cancelarEdicion();
    }

    renderizarTablaNiveles(todosLosNiveles);
  });
}

// 1. Renderizar la Tabla de Niveles
function renderizarTablaNiveles(niveles) {
  const tbody = document.getElementById("lista-niveles");
  const trHeader = document.getElementById("encabezado-tabla");
  if (!tbody || !trHeader) return;

  // Ajustar encabezado según si la edición está activa
  if (modoEdicionActivo) {
    trHeader.innerHTML = `
      <th>Posición</th>
      <th>Nivel</th>
      <th>Creador</th>
      <th>Dificultad</th>
      <th>Progreso</th>
      <th>Jugadores</th>
      <th>Puntos</th>
      <th>Acciones</th>
    `;
  } else {
    trHeader.innerHTML = `
      <th>Posición</th>
      <th>Nivel</th>
      <th>Creador</th>
      <th>Dificultad</th>
      <th>Progreso</th>
      <th>Jugadores</th>
      <th>Puntos</th>
    `;
  }

  tbody.innerHTML = "";

  niveles.forEach((nivel, index) => {
    const nombre = nivel.name || nivel.nombre || "Sin nombre";
    const creador = nivel.creator || nivel.creador || "Desconocido";
    const dificultad = nivel.difficulty || nivel.dificultad || "Easy Demon";
    const progreso = nivel.progress !== undefined ? nivel.progress : (nivel.progreso !== undefined ? nivel.progreso : 100);
    const posicion = nivel.position || nivel.posicion || (index + 1);
    const jugadores = nivel.players || nivel.jugadores || [];

    const puntos = nivel.puntos !== undefined ? nivel.puntos : calcularPuntos(dificultad, progreso);
    const listaJugadores = Array.isArray(jugadores) ? jugadores.join(", ") : jugadores;
    const claseBadge = dificultad.toLowerCase().replace(/\s+/g, '-');

    const tr = document.createElement("tr");

    let contenidoFila = `
      <td>${posicion}</td>
      <td><strong>${nombre}</strong></td>
      <td>${creador}</td>
      <td><span class="badge ${claseBadge}">${dificultad}</span></td>
      <td>${progreso}%</td>
      <td>${listaJugadores}</td>
      <td><strong style="color: #00e5ff;">+${puntos} pts</strong></td>
    `;

    if (modoEdicionActivo) {
      contenidoFila += `
        <td>
          <button class="btn-accion btn-editar" onclick="prepararEdicion(${index})">✏️</button>
          <button class="btn-accion btn-eliminar" onclick="eliminarNivel(${index})">🗑️</button>
        </td>
      `;
    }

    tr.innerHTML = contenidoFila;
    tbody.appendChild(tr);
  });
}

// Preparar formulario para editar un nivel existente
window.prepararEdicion = function(index) {
  const nivel = todosLosNiveles[index];
  if (!nivel) return;

  document.getElementById("edit-index").value = index;
  document.getElementById("nombre").value = nivel.name || nivel.nombre || "";
  document.getElementById("creador").value = nivel.creator || nivel.creador || "";
  document.getElementById("dificultad").value = nivel.difficulty || nivel.dificultad || "Easy Demon";
  document.getElementById("progreso").value = nivel.progress !== undefined ? nivel.progress : (nivel.progreso || 100);
  document.getElementById("posicion").value = nivel.position || nivel.posicion || (index + 1);

  const jugadores = nivel.players || nivel.jugadores || [];
  document.getElementById("jugadores").value = Array.isArray(jugadores) ? jugadores.join(", ") : jugadores;

  // Cambiar estilo e interfaz del formulario
  document.getElementById("titulo-form").textContent = "✏️ Editar Nivel";
  const btnSubmit = document.getElementById("btn-submit");
  btnSubmit.textContent = "GUARDAR CAMBIOS";
  btnSubmit.style.backgroundColor = "#ff9800"; // Naranja para distinguir edición
  
  document.getElementById("btn-cancelar").style.display = "inline-block";

  // Hacer scroll suave hacia el formulario
  document.getElementById("seccion-formulario").scrollIntoView({ behavior: 'smooth' });
};

// Cancelar edición
function cancelarEdicion() {
  document.getElementById("form-nivel").reset();
  document.getElementById("edit-index").value = "-1";
  document.getElementById("titulo-form").textContent = "Añadir nivel";

  const btnSubmit = document.getElementById("btn-submit");
  btnSubmit.textContent = "AÑADIR";
  btnSubmit.style.backgroundColor = "#00e5ff";

  document.getElementById("btn-cancelar").style.display = "none";
}

// Eliminar nivel
window.eliminarNivel = async function(index) {
  const nivel = todosLosNiveles[index];
  const nombre = nivel ? (nivel.name || nivel.nombre) : "este nivel";

  if (confirm(`¿Seguro que deseas eliminar "${nombre}"?`)) {
    // Eliminar el elemento
    todosLosNiveles.splice(index, 1);

    // Reajustar posiciones consecutivas (1, 2, 3...)
    todosLosNiveles.forEach((n, idx) => {
      if (n.position !== undefined) n.position = idx + 1;
      if (n.posicion !== undefined) n.posicion = idx + 1;
    });

    renderizarTablaNiveles(todosLosNiveles);
    renderizarRankingJugadores(todosLosNiveles);

    await guardarEnNube(todosLosNiveles);
  }
};

// Renderizar Ranking de Jugadores
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

// Filtros
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

// Formulario submit (Añadir o Editar)
function configurarFormulario() {
  const form = document.getElementById("form-nivel");
  const btnCancelar = document.getElementById("btn-cancelar");

  if (btnCancelar) {
    btnCancelar.addEventListener("click", cancelarEdicion);
  }

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const editIndex = parseInt(document.getElementById("edit-index").value);
    const posInput = parseInt(document.getElementById("posicion").value);
    const posTarget = (!isNaN(posInput) && posInput > 0) ? posInput : (todosLosNiveles.length + 1);

    const datosNivel = {
      name: document.getElementById("nombre").value,
      creator: document.getElementById("creador").value,
      difficulty: document.getElementById("dificultad").value,
      progress: parseInt(document.getElementById("progreso").value) || 100,
      position: posTarget,
      players: document.getElementById("jugadores").value.split(",").map(j => j.trim()).filter(j => j !== "")
    };

    if (editIndex >= 0) {
      // MODO EDICIÓN: reemplazar datos existentes
      todosLosNiveles[editIndex] = datosNivel;
    } else {
      // MODO AÑADIR: Desplazar los niveles existentes de esa posición hacia abajo (+1)
      todosLosNiveles.forEach(nivel => {
        const posActual = nivel.position || nivel.posicion || 0;
        if (posActual >= posTarget) {
          if (nivel.position !== undefined) nivel.position = posActual + 1;
          if (nivel.posicion !== undefined) nivel.posicion = posActual + 1;
        }
      });

      todosLosNiveles.push(datosNivel);
    }

    // Reordenar por posición
    todosLosNiveles.sort((a, b) => (a.position || a.posicion) - (b.position || b.posicion));

    renderizarTablaNiveles(todosLosNiveles);
    renderizarRankingJugadores(todosLosNiveles);

    await guardarEnNube(todosLosNiveles);

    cancelarEdicion();
  });
}
