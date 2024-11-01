// Import Firebase functions and services
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithPopup, signInAnonymously, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, get, update, remove, onValue } from "firebase/database";
import 'dotenv/config'; // Load environment variables from .env file

// Log API key to check if environment variables are loaded (remove in production)
console.log(process.env.FIREBASE_API_KEY);

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore (optional if using Firestore as well)
const firestoreDb = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Realtime Database
const database = getDatabase(app);

// Export Auth, Database, and Firestore instances, along with supporting functions
export { 
  auth, 
  signInWithPopup, 
  signInAnonymously, 
  googleProvider, 
  signOut, 
  onAuthStateChanged,
  database, 
  ref, 
  set, 
  get, 
  update, 
  remove, 
  onValue, 
  firestoreDb 
};
