"use client";

import { useState, useEffect } from 'react';
import { getAuth, signInWithPopup, FacebookAuthProvider, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, set, get, getDatabase } from 'firebase/database';
import { auth } from '../../firebase';

export default function AuthSidebar() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  
  const db = getDatabase();

  // Function to add user to database
  const addUserToDatabase = async (user) => {
    const userRef = ref(db, `users/${user.uid}`);
    
    try {
      // First, check if the user already exists
      const snapshot = await get(userRef);
      const existingData = snapshot.val();
      
      const userData = {
        email: user.email,
        displayName: user.displayName || username || 'Anonymous',
        profilePicture: user.photoURL || '',
        // If user exists, keep their admin status, otherwise set to false
        admin: existingData ? existingData.admin : false,
        // Only set createdAt if it's a new user
        ...(existingData ? {} : { createdAt: new Date().toISOString() })
      };
      
      await set(userRef, userData);
    } catch (error) {
      console.error("Error managing user in database: ", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      addUserToDatabase(result.user);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  const handleFacebookLogin = async () => {
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      addUserToDatabase(result.user);
    } catch (error) {
      console.error("Error signing in with Facebook: ", error);
    }
  };

  const handleEmailLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      addUserToDatabase(result.user);
    } catch (error) {
      console.error("Error signing in with Email: ", error);
    }
  };

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return false;
    }
    setPasswordError('');
    return true;
  };

  /* Temporarily disabled email sign-up
  const handleEmailSignUp = async () => {
    if (!validatePasswords()) {
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: username
      });

      addUserToDatabase(user);
      
      console.log("User signed up:", user);
    } catch (error) {
      console.error("Error signing up with Email: ", error);
      setPasswordError(error.message);
    }
  };
  */

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setPasswordError('');
    setPassword('');
    setConfirmPassword('');
  };
  
  return (
    <div className="mx-[5%] p-4 md:mx-0 rounded-lg">
      {user ? (
        <div>
          <h2 className="text-xl text-white">Welcome, {user.displayName || 'User'}!</h2>
          <button onClick={handleSignOut} className="mt-2 w-full bg-purple-800 text-white px-4 py-2 rounded-lg hover:bg-red-300 hover:text-red-700">
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
              Sign in with Google
            </button>

            <button onClick={handleFacebookLogin} className="mt-2 w-full bg-gray-950 text-white flex items-center justify-center px-4 py-2 rounded-lg outline outline-1 outline-gray-700 hover:bg-purple-500 hover:bg-opacity-30 hover:outline-purple-800">
              Sign in with Facebook
            </button>
          </div>

          <div className="flex space-x-2">
            <hr className="w-full border-t border-gray-700 my-4" />
            <span className="flex text-gray-500 text-sm items-center justify-center">
              alternatively
            </span>
            <hr className="w-full border-t border-gray-700 my-4" />
          </div>

          <div className="flex-col bg-gray-950 outline outline-1 outline-gray-700 hover:outline-purple-800 rounded-xl w-full h-full p-4 space-y-2">
            {/* Temporarily disabled email sign-up input fields
            {isSignUp && (
              <div>
                <span className="font-white font-sm">Username</span>
                <input
                  type="text"
                  placeholder=""
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex w-full p-2 rounded-lg text-black text-sm outline outline-2 outline-gray-700 focus:outline-purple-400"
                />
              </div>
            )}
            */}
            <div>
              <span className="font-white font-sm">Email</span>
              <input
                type="email"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex w-full p-2 rounded-lg text-black text-sm outline outline-2 outline-gray-700 focus:outline-purple-400"
              />
            </div>
            <div>
              <span className="font-white font-sm">Password</span>
              <input
                type="password"
                placeholder=""
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                className="flex w-full p-2 rounded-lg text-black text-sm outline outline-2 outline-gray-700 focus:outline-purple-400"
              />
            </div>
            
            {/* Temporarily disabled confirm password input
            {isSignUp && (
              <div>
                <span className="font-white font-sm">Confirm Password</span>
                <input
                  type="password"
                  placeholder=""
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError('');
                  }}
                  className="flex w-full p-2 rounded-lg text-black text-sm outline outline-2 outline-gray-700 focus:outline-purple-400"
                />
                {passwordError && (
                  <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                )}
              </div>
            )}
            */}
            
            <div className="py-4 items-center justify-center">
              {isSignUp ? (
                <div>
                  <button disabled className="p-2 text-center bg-gray-700 w-full rounded-lg cursor-not-allowed">
                    Sign Up
                  </button>
                  <p className="text-yellow-500 text-sm mt-2 text-center">
                    Creating an account using email is currently disabled. Please use Google or Facebook to create an account.
                  </p>
                </div>
              ) : (
                <button onClick={handleEmailLogin} className="p-2 text-center bg-purple-800 w-full rounded-lg hover:bg-purple-300 hover:text-purple-800">
                  Sign In
                </button>
              )}
            </div>
          </div>

          <div className="flex space-x-2 text-white text-sm justify-center">
            <span className="text-center">
              {isSignUp ? "Already a user?" : "New to the app?"}
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