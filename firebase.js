import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithPopup, signInAnonymously, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYz6CEV7dfnKkC_W8jLmt-FK2QxbctDpM",
  authDomain: "gema-610a4.firebaseapp.com",
  projectId: "gema-610a4",
  storageBucket: "gema-610a4.appspot.com",
  messagingSenderId: "275057235109",
  appId: "1:275057235109:web:aa381697e7f3bde03fe94c",
  measurementId: "G-DDC0R37JEM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Export auth and other functions
export { auth, signInWithPopup, signInAnonymously, googleProvider, signOut, onAuthStateChanged, db };
