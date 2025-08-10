import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { renderFilmGrid } from "./dom.js";

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

onValue(ref(db, "films"), snapshot => {
  allFilms = snapshot;
  renderFilmGrid(snapshot, currentUser, allowedEmails);
});

window.toggleStatus = (key, currentStatus) => {
  const card = document.querySelector(`[data-key="${key}"]`);
  if (card) {
    card.classList.add("fade-out");
    setTimeout(() => {
      const newStatus = currentStatus === "watched" ? "to_watch" : "watched";
      set(ref(db, `films/${key}/status`), newStatus);
    }, 300);
  } else {
    // fallback au cas où la carte n'existe pas
    const newStatus = currentStatus === "watched" ? "to_watch" : "watched";
    set(ref(db, `films/${key}/status`), newStatus);
  }
};

window.deleteFilm = (key) => {
  if (!currentUser || !allowedEmails[currentUser.email]) {
    alert("❌ Seuls Florine et Fabien peuvent supprimer un film.");
    return;
  }

  if (confirm("Supprimer ce film ?")) {
    remove(ref(db, `films/${key}`));
  }
};


document.getElementById("statusFilter").addEventListener("change", () => renderFilmGrid(allFilms, currentUser, allowedEmails));
document.getElementById("userFilter").addEventListener("change", () => renderFilmGrid(allFilms, currentUser, allowedEmails));
