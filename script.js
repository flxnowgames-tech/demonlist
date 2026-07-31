document.addEventListener("DOMContentLoaded", () => {

  let currentLevels = [];

  async function loadLevels() {
    const response = await fetch("levels-new.json");
    currentLevels = await response.json();
    sortLevels();
    renderTable(currentLevels);

    document.getElementById("search").addEventListener("input", filter);
    document.getElementById("difficultyFilter").addEventListener("change", filter);
  }

  function getDifficultyColor(diff) {
    return {
      "Easy Demon": "var(--easy)",
      "Medium Demon": "var(--medium)",
      "Hard Demon": "var(--hard)",
      "Insane Demon": "var(--insane)",
      "Extreme Demon": "var(--extreme)"
    }[diff];
  }

  function sortLevels() {
    currentLevels.sort((a, b) => a.position - b.position);
    currentLevels.forEach((lvl, i) => lvl.position = i + 1);
  }

  function filter() {
    const search = document.getElementById("search").value.toLowerCase();
    const difficulty = document.getElementById("difficultyFilter").value;

    const filtered = currentLevels.filter(level => {
      const matchesSearch = level.name.toLowerCase().includes(search);
      const matchesDifficulty = difficulty === "" || level.difficulty === difficulty;
      return matchesSearch && matchesDifficulty;
    });

    renderTable(filtered);
  }

  function renderTable(levels) {
    const tbody = document.querySelector("#levelsTable tbody");
    tbody.innerHTML = "";

    levels.forEach((level) => {
      const color = getDifficultyColor(level.difficulty);

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${level.position}</td>
        <td>${level.name}</td>
        <td>${level.creator}</td>
        <td style="color:${color}; font-weight:700;">${level.difficulty}</td>
        <td>
          ${level.progress}% 
          <div class="progress-bar">
            <div class="progress-fill" style="width:${level.progress}%; background:${color};"></div>
          </div>
        </td>
        <td>${level.players.join(", ")}</td>
        <td><button onclick="deleteLevel(${level.position - 1})">Eliminar</button></td>
      `;

      tbody.appendChild(row);
    });
  }

  window.deleteLevel = function(index) {
    currentLevels.splice(index, 1);
    sortLevels();
    renderTable(currentLevels);
  }

  document.getElementById("addBtn").addEventListener("click", () => {
    const name = document.getElementById("newName").value;
    const creator = document.getElementById("newCreator").value;
    const difficulty = document.getElementById("newDifficulty").value;
    const progress = parseInt(document.getElementById("newProgress").value);
    const position = parseInt(document.getElementById("newPosition").value);
    const players = document.getElementById("newPlayers").value.split(",").map(p => p.trim());

    if (!name || !creator || isNaN(progress) || isNaN(position)) {
      alert("Rellena todos los campos.");
      return;
    }

    const newLevel = { 
      name, 
      creator, 
      difficulty, 
      progress,
      position,
      players
    };

    currentLevels.splice(position - 1, 0, newLevel);
    sortLevels();
    renderTable(currentLevels);

    alert("Nivel añadido. Exporta el JSON para guardarlo permanentemente.");
  });

  document.getElementById("exportBtn").addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentLevels, null, 2));
    const dl = document.createElement("a");
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", "levels-new.json");
    dl.click();
  });

  loadLevels();

});
