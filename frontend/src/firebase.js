import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAgBrvrV58aIx1elLF_cgRH43_7ea_iLiI",
  authDomain: "cybersafe-web.firebaseapp.com",
  projectId: "cybersafe-web",
  storageBucket: "cybersafe-web.firebasestorage.app",
  messagingSenderId: "452703470745",
  appId: "1:452703470745:web:9dbe19f78bb2475911e408"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// THE FIX: We explicitly tell the app to look for the database named "default"
export const db = getFirestore(app, "default");