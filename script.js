let currentLevels = [];

async function loadLevels() {
  const response = await fetch("levels.json");
  currentLevels = await response.json();
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

function getIcon(diff) {
  return {
    "Easy Demon": "https://i.imgur.com/8yqYg7T.png",
    "Medium Demon": "https://i.imgur.com/8yqYg7T.png",
    "Hard Demon": "https://i.imgur.com/8yqYg7T.png",
    "Insane Demon": "https://i.imgur.com/8yqYg7T.png",
    "Extreme Demon": "https://i.imgur.com/8yqYg7T.png"
  }[diff];
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

  levels.forEach((level, index) => {
    const row = document.createElement("tr");

    const color = getDifficultyColor(level.difficulty);
    const icon = getIcon(level.difficulty);

    row.innerHTML = `
      <td>${index + 1}</td>
      <td><img src="${icon}" class="demon-icon">${level.name}</td>
      <td>${level.creator}</td>
      <td style="color:${color}; font-weight:700;">${level.difficulty}</td>
      <td>
        ${level.progress}% 
        <div class="progress-bar">
          <div class="progress-fill" style="width:${level.progress}%; background:${color};"></div>
        </div>
      </td>
      <td><button onclick="deleteLevel(${index})">Eliminar</button></td>
    `;

    tbody.appendChild(row);
  });
}

function deleteLevel(index) {
  currentLevels.splice(index, 1);
  renderTable(currentLevels);
}

document.getElementById("addBtn").addEventListener("click", () => {
  const name = document.getElementById("newName").value;
  const creator = document.getElementById("newCreator").value;
  const difficulty = document.getElementById("newDifficulty").value;
  const progress = parseInt(document.getElementById("newProgress").value);

  if (!name || !creator || isNaN(progress)) {
    alert("Rellena todos los campos.");
    return;
  }

  const newLevel = { name, creator, difficulty, progress };
  currentLevels.push(newLevel);
  renderTable(currentLevels);

  alert("Nivel añadido. Exporta el JSON para guardarlo permanentemente.");
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentLevels, null, 2));
  const dl = document.createElement("a");
  dl.setAttribute("href", dataStr);
  dl.setAttribute("download", "levels.json");
  dl.click();
});

loadLevels();
