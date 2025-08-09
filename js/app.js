import { db, auth, provider } from "./firebase.js";
import { login, logout } from "./auth.js";
import { renderFilmGrid } from "./dom.js";
import { ref, push, onValue, remove, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const allowedEmails = {
  "moutoussamy.florine@gmail.com": "Florine",
  "fabien.ogli@gmail.com": "Fabien"
};

let currentUser = null;
let allFilms = [];

document.getElementById("signInBtn").addEventListener("click", async () => {
  const user = await login(auth, provider, allowedEmails, (user) => {
    document.getElementById("userDisplay").textContent = `Connecté : ${allowedEmails[user.email]}`;
  });
  if (user) {
    currentUser = user;
    listenToFilms();
  }
});

document.getElementById("signOutBtn").addEventListener("click", async () => {
  await logout(auth, () => {
    currentUser = null;
    document.getElementById("userDisplay").textContent = "";
    document.getElementById("filmGrid").innerHTML = "";
  });
});

document.getElementById("filmForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("filmInput").value.trim();
  if (!currentUser) return alert("Connexion requise");

  const res = await fetch(`https://www.omdbapi.com/?apikey=d380a270&t=${encodeURIComponent(title)}`);
  const data = await res.json();
  if (data.Response === "False") return alert("Film non trouvé.");

  const film = {
    title: data.Title,
    director: data.Director,
    imdbRating: data.imdbRating,
    poster: data.Poster,
    addedBy: currentUser.email,
    status: "to_watch"
  };
  push(ref(db, "films"), film);
  document.getElementById("filmInput").value = "";
});

function listenToFilms() {
  onValue(ref(db, "films"), (snapshot) => {
  console.log("✅ Films reçus depuis Firebase :", snapshot.size);
  allFilms = snapshot;
  renderFilmGrid(snapshot, currentUser, allowedEmails);
});
}

window.toggleStatus = (key, currentStatus) => {
  const newStatus = currentStatus === "watched" ? "to_watch" : "watched";
  set(ref(db, `films/${key}/status`), newStatus);
};

window.deleteFilm = (key) => {
  if (confirm("Supprimer ce film ?")) {
    remove(ref(db, `films/${key}`));
  }
};

document.getElementById("statusFilter").addEventListener("change", () => renderFilmGrid(allFilms, currentUser, allowedEmails));
document.getElementById("userFilter").addEventListener("change", () => renderFilmGrid(allFilms, currentUser, allowedEmails));
