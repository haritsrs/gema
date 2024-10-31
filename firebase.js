import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestore, not used currently but initialized here
import { getAuth, signInWithPopup, signInAnonymously, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, push, get, update, remove, onValue } from "firebase/database";

// Load environment variables from .env file
require('dotenv').config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
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
