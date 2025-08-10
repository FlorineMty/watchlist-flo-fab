export function renderFilmGrid(snapshot, currentUser, allowedEmails) {
  const grid = document.getElementById("filmGrid");
  grid.innerHTML = '';

  const statusFilter = document.getElementById("statusFilter").value;
  const userFilter = document.getElementById("userFilter").value;

  snapshot.forEach(child => {
    const film = child.val();
    const key = child.key;

    const email = film.addedBy?.toLowerCase() || '';
    const addedName = allowedEmails[email] || "Inconnu";

    // ✅ Filtrage strict par email associé au prénom sélectionné
    const expectedEmail = Object.keys(allowedEmails).find(
      key => allowedEmails[key].toLowerCase() === userFilter
    );

    const statusMatch = statusFilter === "all" || film.status === statusFilter;
    const userMatch = userFilter === "all" || email === expectedEmail;

    if (statusMatch && userMatch) {
      const isAuthorized = currentUser?.email && allowedEmails[currentUser.email];

      const deleteButtonHTML = isAuthorized
        ? `<button onclick="window.deleteFilm('${key}')">🗑️</button>`
        : '';

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
        ${deleteButtonHTML}
      `;
      grid.appendChild(div);
    }
  });
}
