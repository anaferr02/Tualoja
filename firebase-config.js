import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "ACA_TU_API_KEY",
  authDomain: "ACA_TU_AUTH_DOMAIN",
  projectId: "ACA_TU_PROJECT_ID",
  storageBucket: "ACA_TU_STORAGE_BUCKET",
  messagingSenderId: "ACA_TU_MESSAGING_SENDER_ID",
  appId: "ACA_TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
