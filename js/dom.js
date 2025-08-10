export function renderFilmGrid(snapshot, currentUser, allowedEmails) {
  const grid = document.getElementById("filmGrid");
  grid.innerHTML = '';

  const statusFilter = document.getElementById("statusFilter").value;
  const userFilter = document.getElementById("userFilter").value;

  snapshot.forEach(child => {
    const film = child.val();
    const key = child.key;

    const email = (film.addedBy || "").toLowerCase();
    const addedName = allowedEmails[email] || email;

    // 🔐 Comparaison stricte par email exact (basé sur prénom sélectionné)
    let expectedEmail = null;
    if (userFilter !== "all") {
      for (const emailKey in allowedEmails) {
        if (allowedEmails[emailKey].toLowerCase() === userFilter) {
          expectedEmail = emailKey;
          break;
        }
      }
    }

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
          <button class="toggle-status" onclick="window.toggleStatus('${key}', '${film.status}')">
          ${film.status === "watched" ? "✅ Vu" : "🎯 À voir"}
          </button>
        </div>

        ${deleteButtonHTML}
      `;
      grid.appendChild(div);
    }
  });
}
