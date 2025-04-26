// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCkdCKmBma_sRaq-B-vvOteolppac22vwE",
  authDomain: "aivoiceagent-61c52.firebaseapp.com",
  projectId: "aivoiceagent-61c52",
  storageBucket: "aivoiceagent-61c52.firebasestorage.app",
  messagingSenderId: "979907783911",
  appId: "1:979907783911:web:632f80934f98298d70c642",
  measurementId: "G-HNX77G3J4X",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// Initialize Firebase Authentication and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
// Initialize Firebase Analytics
// Uncomment the following line if you need Firebase Analytics
// const analytics = getAnalytics(app);
