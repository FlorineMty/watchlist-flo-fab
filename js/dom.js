export function renderFilmGrid(snapshot, currentUser, allowedEmails) {
  const toWatchList = document.getElementById("toWatchList");
  const watchedList = document.getElementById("watchedList");
  const watchedColumn = document.getElementById("watchedColumn");

  toWatchList.innerHTML = '';
  watchedList.innerHTML = '';

  const statusFilter = document.getElementById("statusFilter").value;
  const userFilter = document.getElementById("userFilter").value;

  let hasWatched = false;

  snapshot.forEach(child => {
    const film = child.val();
    const key = child.key;

    film.status = (film.status || "").toLowerCase();

    const email = (film.addedBy || "").toLowerCase();
    const addedName = allowedEmails[email] || email;

    let expectedEmail = null;
    if (userFilter !== "all") {
      expectedEmail = Object.keys(allowedEmails).find(
        k => allowedEmails[k].toLowerCase() === userFilter
      );
    }

    const statusMatch = statusFilter === "all" || film.status === statusFilter;
    const userMatch = userFilter === "all" || email === expectedEmail;

    // 🔐 Vérifie si l’utilisateur connecté est autorisé
    const currentEmail = (currentUser?.email || "").toLowerCase();
    const isAuthorized = currentEmail in allowedEmails;

    const deleteButtonHTML = isAuthorized
      ? `<button onclick="window.deleteFilm('${key}')">🗑️</button>`
      : '';

    if (statusMatch && userMatch) {
      const div = document.createElement("div");
      div.setAttribute("data-key", key);

      if (film.status === "to_watch") {
        div.className = "film-card fade-in";
        div.innerHTML = `
          <img src="${film.poster}" alt="Affiche">
          <h3>${film.title}</h3>
          <p>🎬 ${film.director}</p>
          <p>⭐ IMDb : ${film.imdbRating}</p>
          <p>👤 ${addedName}${email === currentEmail ? " (vous)" : ""}</p>
          <div class="status-toggle">
            <button class="toggle-status" onclick="window.toggleStatus('${key}', '${film.status}')">
              🎯 À voir
            </button>
          </div>
          ${deleteButtonHTML}
        `;
        toWatchList.appendChild(div);
      }

      if (film.status === "watched") {
        hasWatched = true;
        div.className = "film-card condensed fade-in";
        div.innerHTML = `
          <h4>${film.title}</h4>
          <span>⭐ ${film.imdbRating}</span>
          <button class="toggle-status" onclick="window.toggleStatus('${key}', '${film.status}')">
            ↩️ Remettre à voir
          </button>
          ${deleteButtonHTML}
        `;
        watchedList.appendChild(div);
      }
    }
  });

  // 🕵️‍♀️ Masque ou affiche la colonne "Vu"
  watchedColumn.style.display = hasWatched ? "block" : "none";
}
