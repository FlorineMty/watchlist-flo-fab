export function renderFilmGrid(snapshot, currentUser, allowedEmails) {
  const grid = document.getElementById("filmGrid");
  grid.innerHTML = '';
  snapshot.forEach(child => {
    const film = child.val();
    const key = child.key;
    const addedName = allowedEmails[film.addedBy] || "Inconnu";

    const div = document.createElement("div");
    div.className = "film-card";
    div.innerHTML = `
      <img src="${film.poster}" alt="Affiche">
      <h3>${film.title}</h3>
      <p>🎬 ${film.director}</p>
      <p>⭐ IMDb : ${film.imdbRating}</p>
      <p>👤 ${addedName}${currentUser?.email === film.addedBy ? " (vous)" : ""}</p>
      <p><strong>Statut :</strong> ${film.status === "watched" ? "✅ Vu" : "⏳ À voir"}</p>
      <div class="status-toggle">
        <label>
          <input type="checkbox" ${film.status === "watched" ? "checked" : ""} onchange="window.toggleStatus('${key}', '${film.status}')">
          Marquer comme vu
        </label>
      </div>
      <button onclick="window.deleteFilm('${key}')">🗑️</button>
    `;
    grid.appendChild(div);
  });
}