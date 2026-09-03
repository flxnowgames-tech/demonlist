const BIN_ID = "6a994acdf5f4af5e2964e2e4";
const MASTER_KEY = "$2a$10$L3EwXJA5bVnItMjuEeGuiO2i0UvTltIS2YGBm7VsUVY8st/yX66lW";

const PUNTOS_TIERLIST = {
  "Extreme Demon": 100,
  "Insane Demon": 75,
  "Hard Demon": 50,
  "Medium Demon": 25,
  "Easy Demon": 10
};

let todosLosNiveles = [];
let nivelesFiltradosActuales = [];
let modoEdicionActivo = false;

// 📄 Variables de Paginación
let paginaActual = 1;
const NIVELES_POR_PAGINA = 10;

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
  configurarPaginacion();
});

// Cargar niveles desde la nube
async function cargarNiveles() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: {
        "X-Master-Key": MASTER_KEY,
        "X-Bin-Meta": "false"
      }
    });

    if (!response.ok) throw new Error("Error al cargar datos");

    todosLosNiveles = await response.json();
    nivelesFiltradosActuales = [...todosLosNiveles];

    renderizarTablaNiveles();
    renderizarRankingJugadores(todosLosNiveles);
  } catch (error) {
    console.error("Error en JSONBin:", error);
  }
}

// Guardar en la nube
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

    if (!response.ok) throw new Error("No se pudo guardar");
  } catch (error) {
    console.error("Error guardando en la nube:", error);
    alert("Hubo un error guardando los datos.");
  }
}

// 🕹️ Configuración de los Controles de Paginación
function configurarPaginacion() {
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const inputPagina = document.getElementById("input-pagina");

  btnPrev.addEventListener("click", () => {
    if (paginaActual > 1) {
      paginaActual--;
      renderizarTablaNiveles();
    }
  });

  btnNext.addEventListener("click", () => {
    const totalPaginas = Math.ceil(nivelesFiltradosActuales.length / NIVELES_POR_PAGINA) || 1;
    if (paginaActual < totalPaginas) {
      paginaActual++;
      renderizarTablaNiveles();
    }
  });

  // Ir a una página escribiendo en el recuadro
  inputPagina.addEventListener("change", () => {
    let nuevaPagina = parseInt(inputPagina.value);
    const totalPaginas = Math.ceil(nivelesFiltradosActuales.length / NIVELES_POR_PAGINA) || 1;

    if (isNaN(nuevaPagina) || nuevaPagina < 1) nuevaPagina = 1;
    if (nuevaPagina > totalPaginas) nuevaPagina = totalPaginas;

    paginaActual = nuevaPagina;
    renderizarTablaNiveles();
  });
}

// Renderizar Tabla con Paginación
function renderizarTablaNiveles() {
  const tbody = document.getElementById("lista-niveles");
  const trHeader = document.getElementById("encabezado-tabla");
  const inputPagina = document.getElementById("input-pagina");
  const txtTotalPaginas = document.getElementById("total-paginas");
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");

  if (!tbody || !trHeader) return;

  // Calcular páginas totales
  const totalPaginas = Math.ceil(nivelesFiltradosActuales.length / NIVELES_POR_PAGINA) || 1;

  // Ajustar si la página actual excede el total
  if (paginaActual > totalPaginas) paginaActual = totalPaginas;

  // Actualizar UI de Paginación
  inputPagina.value = paginaActual;
  txtTotalPaginas.textContent = `/ ${totalPaginas}`;
  btnPrev.disabled = (paginaActual === 1);
  btnNext.disabled = (paginaActual === totalPaginas);

  // Obtener solo los 10 niveles de la página actual
  const inicio = (paginaActual - 1) * NIVELES_POR_PAGINA;
  const fin = inicio + NIVELES_POR_PAGINA;
  const nivelesPagina = nivelesFiltradosActuales.slice(inicio, fin);

  // Encabezado
  trHeader.innerHTML = `
    <th>Posición</th>
    <th>Nivel</th>
    <th>Creador</th>
    <th>Dificultad</th>
    <th>Progreso</th>
    <th>Jugadores</th>
    <th>Puntos</th>
    ${modoEdicionActivo ? '<th>Acciones</th>' : ''}
  `;

  tbody.innerHTML = "";

  if (nivelesPagina.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${modoEdicionActivo ? 8 : 7}" style="text-align: center; color: #8a99ad;">No hay niveles para mostrar</td></tr>`;
    return;
  }

  nivelesPagina.forEach((nivel) => {
    // Buscar el índice original para edición/eliminación
    const indexOriginal = todosLosNiveles.indexOf(nivel);

    const nombre = nivel.name || nivel.nombre || "Sin nombre";
    const creador = nivel.creator || nivel.creador || "Desconocido";
    const dificultad = nivel.difficulty || nivel.dificultad || "Easy Demon";
    const progreso = nivel.progress !== undefined ? nivel.progress : (nivel.progreso !== undefined ? nivel.progreso : 100);
    const posicion = nivel.position || nivel.posicion || (indexOriginal + 1);
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
          <button class="btn-accion btn-editar" onclick="prepararEdicion(${indexOriginal})">✏️</button>
          <button class="btn-accion btn-eliminar" onclick="eliminarNivel(${indexOriginal})">🗑️</button>
        </td>
      `;
    }

    tr.innerHTML = contenidoFila;
    tbody.appendChild(tr);
  });
}

// Configurar Filtros (resetea a Página 1 al buscar)
function configurarFiltros() {
  const inputBuscar = document.getElementById("buscar");
  const selectFiltro = document.getElementById("filtro-dificultad");

  function aplicarFiltros() {
    const textoBusqueda = inputBuscar ? inputBuscar.value.toLowerCase() : "";
    const dificultadSeleccionada = selectFiltro ? selectFiltro.value : "todas";

    nivelesFiltradosActuales = todosLosNiveles.filter(nivel => {
      const nombre = (nivel.name || nivel.nombre || "").toLowerCase();
      const creador = (nivel.creator || nivel.creador || "").toLowerCase();
      const dificultad = nivel.difficulty || nivel.dificultad || "";

      const coincideTexto = nombre.includes(textoBusqueda) || creador.includes(textoBusqueda);
      const coincideDificultad = dificultadSeleccionada === "todas" || dificultad === dificultadSeleccionada;

      return coincideTexto && coincideDificultad;
    });

    paginaActual = 1; // Volver a la primera página al filtrar
    renderizarTablaNiveles();
  }

  if (inputBuscar) inputBuscar.addEventListener("input", aplicarFiltros);
  if (selectFiltro) selectFiltro.addEventListener("change", aplicarFiltros);
}

// Botón Modo Edición
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

    renderizarTablaNiveles();
  });
}

// Preparar edición
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

  document.getElementById("titulo-form").textContent = "✏️ Editar Nivel";
  const btnSubmit = document.getElementById("btn-submit");
  btnSubmit.textContent = "GUARDAR CAMBIOS";
  btnSubmit.style.backgroundColor = "#ff9800";
  
  document.getElementById("btn-cancelar").style.display = "inline-block";

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
    todosLosNiveles.splice(index, 1);

    todosLosNiveles.forEach((n, idx) => {
      if (n.position !== undefined) n.position = idx + 1;
      if (n.posicion !== undefined) n.posicion = idx + 1;
    });

    nivelesFiltradosActuales = [...todosLosNiveles];

    renderizarTablaNiveles();
    renderizarRankingJugadores(todosLosNiveles);

    await guardarEnNube(todosLosNiveles);
  }
};

// Ranking de Jugadores
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

// Formulario submit (Añadir/Editar)
function configurarFormulario() {
  const form = document.getElementById("form-nivel");
  const btnCancelar = document.getElementById("btn-cancelar");

  if (btnCancelar) btnCancelar.addEventListener("click", cancelarEdicion);
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
      todosLosNiveles[editIndex] = datosNivel;
    } else {
      // Desplazar niveles existentes hacia abajo
      todosLosNiveles.forEach(nivel => {
        const posActual = nivel.position || nivel.posicion || 0;
        if (posActual >= posTarget) {
          if (nivel.position !== undefined) nivel.position = posActual + 1;
          if (nivel.posicion !== undefined) nivel.posicion = posActual + 1;
        }
      });

      todosLosNiveles.push(datosNivel);
    }

    todosLosNiveles.sort((a, b) => (a.position || a.posicion) - (b.position || b.posicion));
    nivelesFiltradosActuales = [...todosLosNiveles];

    // Ir automáticamente a la página donde quedó el nuevo nivel
    paginaActual = Math.ceil(posTarget / NIVELES_POR_PAGINA);

    renderizarTablaNiveles();
    renderizarRankingJugadores(todosLosNiveles);

    await guardarEnNube(todosLosNiveles);

    cancelarEdicion();
  });
}
