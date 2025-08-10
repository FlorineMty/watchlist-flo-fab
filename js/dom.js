export function renderFilmGrid(snapshot, currentUser, allowedEmails) {
  const toWatchList = document.getElementById("toWatchList");
  const watchedList = document.getElementById("watchedList");

  toWatchList.innerHTML = '';
  watchedList.innerHTML = '';

  const statusFilter = document.getElementById("statusFilter").value;
  const userFilter = document.getElementById("userFilter").value;

  snapshot.forEach(child => {
    const film = child.val();
    const key = child.key;

    // ✅ Normalize status
    film.status = (film.status || "").toLowerCase();

    const email = (film.addedBy || "").toLowerCase();
    const addedName = allowedEmails[email] || email;

    // 🔍 Filtrage utilisateur
    let expectedEmail = null;
    if (userFilter !== "all") {
      expectedEmail = Object.keys(allowedEmails).find(
        key => allowedEmails[key].toLowerCase() === userFilter
      );
    }

    const statusMatch = statusFilter === "all" || film.status === statusFilter;
    const userMatch = userFilter === "all" || email === expectedEmail;

    if (statusMatch && userMatch) {
      const isAuthorized = currentUser?.email && allowedEmails[currentUser.email];
      const deleteButtonHTML = isAuthorized
        ? `<button onclick="window.deleteFilm('${key}')">🗑️</button>`
        : '';

      let div;

      if (film.status === "to_watch") {
        div = document.createElement("div");
        div.className = "film-card";
        div.innerHTML = `
          <img src="${film.poster}" alt="Affiche">
          <h3>${film.title}</h3>
          <p>🎬 ${film.director}</p>
          <p>⭐ IMDb : ${film.imdbRating}</p>
          <p>👤 ${addedName}${currentUser?.email === film.addedBy ? " (vous)" : ""}</p>
          <div class="status-toggle">
            <button class="toggle-status" onclick="window.toggleStatus('${key}', '${film.status}')">
              🎯 À voir
            </button>
          </div>
          ${deleteButtonHTML}
        `;
        toWatchList.appendChild(div);
      } else if (film.status === "watched") {
        div = document.createElement("div");
        div.className = "film-card condensed";
        div.innerHTML = `
          <h4>${film.title}</h4>
          <span>⭐ ${film.imdbRating}</span>
          ${deleteButtonHTML}
        `;
        watchedList.appendChild(div);
      }
    }
  });
}
