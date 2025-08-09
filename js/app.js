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
  "moutoussamy.florine@gmail.com": "Florine",
  "fabien.ogli@gmail.com": "Fabien"
};

// Connexion Google
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

// Déconnexion
document.getElementById("signOutBtn").addEventListener("click", () => {
  auth.signOut().then(() => {
    currentUser = null;
    document.getElementById("userDisplay").textContent = "";
    alert("Déconnecté !");
  });
});

// Ajout de film
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

// Affichage des films
function renderFilmGrid(snapshot) {
  const grid = document.getElementById("filmGrid");
  grid.innerHTML = '';
  const statusFilter = document.getElementById("statusFilter").value;
  const userFilter = document.getElementById("userFilter").value;
  
  snapshot.forEach(child => {
    const film = child.val();
    const key = child.key;
    const addedName = allowedEmails[film.addedBy] || "Inconnu";

    const statusMatch = statusFilter === "all" || film.status === statusFilter;
    const userMatch = userFilter === "all"
      || (userFilter === "florine" && film.addedBy === "moutoussamy.florine@gmail.com")
      || (userFilter === "fabien" && film.addedBy === "fabien.ogli@gmail.com");

    if (statusMatch && userMatch) {
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
}

// Récupération des films en temps réel
onValue(ref(db, "films"), snapshot => {
  allFilms = snapshot;
  renderFilmGrid(snapshot);
});

// Toggle statut
window.toggleStatus = (key, currentStatus) => {
  const newStatus = currentStatus === "watched" ? "to_watch" : "watched";
  set(ref(db, `films/${key}/status`), newStatus);
};

// Supprimer un film
window.deleteFilm = (key) => {
  if (confirm("Supprimer ce film ?")) {
    remove(ref(db, `films/${key}`));
  }
};

// Filtres
document.getElementById("statusFilter").addEventListener("change", () => renderFilmGrid(allFilms));
document.getElementById("userFilter").addEventListener("change", () => renderFilmGrid(allFilms));
