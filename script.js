async function loadLevels() {
  const response = await fetch("levels.json");
  const levels = await response.json();
  renderTable(levels);

  const searchInput = document.getElementById("search");
  const difficultyFilter = document.getElementById("difficultyFilter");

  searchInput.addEventListener("input", () => {
    filter(levels);
  });

  difficultyFilter.addEventListener("change", () => {
    filter(levels);
  });
}

function filter(levels) {
  const search = document.getElementById("search").value.toLowerCase();
  const difficulty = document.getElementById("difficultyFilter").value;

  const filtered = levels.filter(level => {
    const matchesSearch = level.name.toLowerCase().includes(search);
    const matchesDifficulty = difficulty === "" || level.difficulty === difficulty;
    return matchesSearch && matchesDifficulty;
  });

  renderTable(filtered);
}

function renderTable(levels) {
  const tbody = document.querySelector("#levelsTable tbody");
  tbody.innerHTML = "";

  levels.forEach(level => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${level.name}</td>
      <td>${level.creator}</td>
      <td>${level.difficulty}</td>
      <td>${level.progress}%</td>
    `;

    tbody.appendChild(row);
  });
}

loadLevels();