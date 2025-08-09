import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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
export const db = getDatabase(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

