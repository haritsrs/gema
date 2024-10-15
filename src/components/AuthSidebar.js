"use client";

import { useState, useEffect } from 'react';
import { getAuth, signInWithPopup, signInAnonymously, GoogleAuthProvider, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';

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
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Error signing in anonymously: ", error);
    }
  };

  const handleEmailLogin = async () => {
    const email = prompt("Enter your email:");
    const password = prompt("Enter your password:");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error signing in with Email: ", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className="bg-gray-800 mx-[5%] p-4 md:mx-0 rounded-lg">
      {user ? (
        <div>
          <h2 className="text-xl text-white">Welcome, {user.displayName || 'User'}!</h2>
          <button onClick={handleSignOut} className="mt-2 w-full bg-red-500 text-white px-4 py-2 rounded">
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-xl text-white py-2 md:py-0">New to the app?</h2>
          <button onClick={handleGoogleLogin} className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded">
            Sign in with Google
          </button>
          <button onClick={handleAnonymousLogin} className="mt-2 w-full bg-gray-500 text-sm text-white px-4 py-2 rounded">
            Sign in Anonymously
          </button>
          <button onClick={handleEmailLogin} className="mt-2 w-full bg-green-500 text-white px-4 py-2 rounded">
            Sign in with Email
          </button>
        </div>
      )}
    </div>
  );
}
