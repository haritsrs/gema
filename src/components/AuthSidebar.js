"use client";

import { useState, useEffect } from 'react';
import { getAuth, signInWithPopup, signInAnonymously, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword} from 'firebase/auth';
import { auth } from '../../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faMask } from '@fortawesome/free-solid-svg-icons';


export default function AuthSidebar() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

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
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error signing in with Email: ", error);
    }
  };

  const handleEmailSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error signing up with Email: ", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp); // Toggle between sign in and sign up
  };

  return (
    <div className="mx-[5%] p-4 md:mx-0 rounded-lg">
      {user ? (
        <div>
          <h2 className="text-xl text-white">Welcome, {user.displayName || 'User'}!</h2>
          <button onClick={handleSignOut} className="mt-2 w-full bg-red-500 text-white px-4 py-2 rounded">
            Sign Out
          </button>
        </div>
      ) : (
        <div className="flex-col space-y-10 py-10">

          <div className="flex-col">
            <h2 className="flex text-xl text-white py-2 md:py-0">
              Welcome to GEMA!
            </h2>
            
            <button onClick={handleGoogleLogin} className="mt-2 w-full bg-gray-950 text-white flex items-center justify-center px-4 py-2 rounded-lg outline outline-1 outline-gray-700 hover:bg-purple-500 hover:bg-opacity-30 hover:outline-purple-800">
              <FontAwesomeIcon icon={faGoogle} className="mr-4" />
              Sign in with Google
            </button>

            <button onClick={handleAnonymousLogin} className="mt-2 w-full bg-gray-950 text-white flex items-center justify-center px-4 py-2 rounded-lg outline outline-1 outline-gray-700 hover:bg-purple-500 hover:bg-opacity-30 hover:outline-purple-800">
              <FontAwesomeIcon icon={faMask} className="mr-4" />
              Sign in Anonymously
            </button>
          </div>

          <div className="flex space-x-2">
            <hr className="w-full border-t border-gray-700 my-4" />
            <span className="flex text-gray-500 text-sm items-center justify-center">
              alternatively
            </span>
            <hr className="w-full border-t border-gray-700 my-4" />
          </div>

          {/* Email and Password input fields */}
          <div className="flex-col bg-gray-950 outline outline-1 outline-gray-700 hover:outline-purple-800 rounded-xl w-full h-full p-4 space-y-2">
            <div>
              <span className="font-white font-sm">
                  Email
              </span>
              <input
                type="email"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex w-full p-2 rounded-lg text-black text-sm outline outline-2 outline-gray-700 focus:outline-purple-400"
              />
            </div>
            <div>
              <span className="font-white font-sm">
                Password
              </span>
              <input
                type="password"
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex w-full p-2 rounded-lg text-black text-sm outline outline-2 outline-gray-700 focus:outline-purple-400"
              />
            </div>
            
            <div className="py-4 items-center justify-center">
              {/* Toggle between Sign In and Sign Up */}
              {isSignUp ? (
                <button onClick={handleEmailSignUp} className="p-2 text-center bg-purple-800 w-full rounded-lg">
                  Sign Up
                </button>
              ) : (
                <button onClick={handleEmailLogin} className="p-2 text-center bg-purple-800 w-full rounded-lg">
                  Sign In
                </button>
              )}
            </div>
          </div>

          <div className="flex space-x-2 text-white text-sm justify-center">
            <span className="text-center">
              {isSignUp ? 
                "Already a user?" : "New to the app?"
              }
            </span>

            <button onClick={toggleAuthMode} className="bg-opacity-0 text-center text-purple-800 hover:text-white">
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

