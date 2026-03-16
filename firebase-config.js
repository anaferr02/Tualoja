import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCj82nKioR0zTYQJPMUme0yFCXDKivVC_g",
  authDomain: "tualoja-5210e.firebaseapp.com",
  projectId: "tualoja-5210e",
  storageBucket: "tualoja-5210e.firebasestorage.app",
  messagingSenderId: "472294290866",
  appId: "1:472294290866:web:7bc5d811c4c63bea9660ab",
  measurementId: "G-M9H49YEZSN"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
