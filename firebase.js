import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestore, not used currently but initialized here
import { getAuth, signInWithPopup, signInAnonymously, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, push, get, update, remove, onValue } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYz6CEV7dfnKkC_W8jLmt-FK2QxbctDpM",
  authDomain: "gema-610a4.firebaseapp.com",
  projectId: "gema-610a4",
  storageBucket: "gema-610a4.appspot.com",
  messagingSenderId: "275057235109",
  appId: "1:275057235109:web:aa381697e7f3bde03fe94c",
  measurementId: "G-DDC0R37JEM",
  databaseURL: "https://gema-610a4-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (optional if only using Realtime Database)
const firestoreDb = getFirestore(app); // Firestore is assigned to a separate variable for clarity

// Initialize Firebase Authentication
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Realtime Database
const database = getDatabase(app); // Ensure this is the Realtime Database

// Export Auth, Database, and Firestore separately to avoid confusion
export { auth, signInWithPopup, signInAnonymously, googleProvider, signOut, onAuthStateChanged };
export { database, ref, set, get, update, remove, onValue }; // Export Realtime Database instance
export { firestoreDb }; // Export Firestore instance if needed elsewhere
