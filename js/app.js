import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBQClDY0C0tYyCnCQRNVh4YvDaA1kFA9RM",
  authDomain: "watchlist-468413.firebaseapp.com",
  databaseURL: "https://watchlist-468413-default-rtdb.firebaseio.com",
  projectId: "watchlist-468413",
  storageBucket: "watchlist-468413.firebasestorage.app",
  messagingSenderId: "753185542113",
  appId: "1:753185542113:web:55d66596166438c63c8ca0"
};

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  let currentUser = null;
  let allFilms = [];

  const allowedEmails = {
    "moutoussamy.florine@gmail.com": "florine",
    "fabien.ogli@gmail.com": "fabien"
  };

  document.getElementById("signInBtn").addEventListener("click", () => {
    signInWithPopup(auth, provider).then(result => {
  const email = result.user.email;
  if (!allowedEmails[email]) {
    alert("❌ Accès réservé à Florine et Fabien.");
    return;
  }
  currentUser = result.user;
  document.getElementById("userDisplay").textContent = "Connecté en tant que : " + allowedEmails[email];
});
  });

  document.getElementById("signOutBtn").addEventListener("click", () => {
  auth.signOut().then(() => {
    currentUser = null;
    document.getElementById("userDisplay").textContent = "";
    alert("Déconnecté !");
  });
});

  document.getElementById("filmForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("filmInput").value.trim();
    if (!currentUser || !allowedEmails[currentUser.email]) return alert("Connexion requise.");
    const res = await fetch(`https://www.omdbapi.com/?apikey=d380a270&t=${encodeURIComponent(title)}`);
    const data = await res.json();
    if (data.Response === "False") return alert("Film non trouvé.");
    const film = {
      title: data.Title,
      director: data.Director || "Inconnu",
      imdbRating: data.imdbRating || "N/A",
      poster: data.Poster !== "N/A" ? data.Poster : "",
      addedBy: currentUser.email,
      status: "to_watch"
    };
    push(ref(db, "films"), film);
    document.getElementById("filmInput").value = '';
  });

  function renderFilmGrid(snapshot) {
  console.log("✅ Fonction renderFilmGrid appelée");

  const grid = document.getElementById("filmGrid");
  grid.innerHTML = '';

  const statusFilter = document.getElementById("statusFilter").value;
  const userFilter = document.getElementById("userFilter").value;

  let filmsDisplayed = 0;

  snapshot.forEach(child => {
    const film = child.val();
    const key = child.key;

    const email = (film.addedBy || "").toLowerCase();
    const addedName = allowedEmails[email] || email || "Inconnu";

    const statusMatch = true;
    const userMatch = true;

    if (statusMatch && userMatch) {
      filmsDisplayed++;
      console.log("✅ Affichage du film :", film.title);

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
    }
  });

  if (filmsDisplayed === 0) {
    console.warn("⚠️ Aucun film affiché malgré des données Firebase");
    grid.innerHTML = `<p style="text-align:center;">Aucun film trouvé</p>`;
  }
}

  onValue(ref(db, "films"), snapshot => {
  console.log("📦 Films reçus depuis Firebase :", snapshot.size);

  if (snapshot.size === 0) {
    console.warn("⚠️ Aucune donnée dans le nœud 'films'");
  }

  snapshot.forEach(child => {
    const film = child.val();
    const key = child.key;
    console.log("🎞️ Film reçu :", film.title, "| Ajouté par :", film.addedBy);
  });

  allFilms = snapshot;
  renderFilmGrid(snapshot);
});

  window.toggleStatus = (key, currentStatus) => {
    const newStatus = currentStatus === "watched" ? "to_watch" : "watched";
    set(ref(db, `films/${key}/status`), newStatus);
  };

  window.deleteFilm = (key) => {
    if (confirm("Supprimer ce film ?")) {
      remove(ref(db, `films/${key}`));
    }
  };

  document.getElementById("statusFilter").addEventListener("change", () => renderFilmGrid(allFilms));
  document.getElementById("userFilter").addEventListener("change", () => renderFilmGrid(allFilms));
