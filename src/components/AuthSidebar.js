"use client"; // Make sure this line is at the top of the file

import { useState, useEffect } from 'react';
import { getAuth, signInWithPopup, signInAnonymously, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../../firebase'; // Adjust the import path if necessary
console.log("Auth object:", auth); 

export default function AuthSidebar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      console.log("Attempting Google sign-in..."); // Debug log
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      console.log("Attempting anonymous sign-in..."); // Debug log
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Error signing in anonymously: ", error);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log("Signing out..."); // Debug log
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      {user ? (
        <div>
          <h2 className="text-xl">Welcome, {user.displayName || 'User'}!</h2>
          <button onClick={handleSignOut} className="mt-2 bg-red-500 text-white px-4 py-2 rounded">
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-xl">New to the app?</h2>
          <button onClick={handleGoogleLogin} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
            Sign in with Google
          </button>
          <button onClick={handleAnonymousLogin} className="mt-2 bg-gray-500 text-white px-4 py-2 rounded">
            Sign in Anonymously
          </button>
        </div>
      )}
    </div>
  );
}
