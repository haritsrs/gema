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

  const getDefaultUsername = (email) => {
    return email.split('@')[0];
  };

  // Function to add user to database
  const addUserToDatabase = async (user) => {
    const userRef = ref(db, `users/${user.uid}`);

    try {
      // First, check if the user already exists
      const snapshot = await get(userRef);
      const existingData = snapshot.val();

      // Prepare the user data object
      const userData = {
        email: user.email,
        // Only set username and displayName for new users
        username: existingData?.username || getDefaultUsername(user.email),
        displayName: existingData?.displayName || user.displayName || getDefaultUsername(user.email),
        profilePicture: user.photoURL || existingData?.profilePicture || '',
        admin: existingData?.admin || false,
        // Only set createdAt if it's a new user
        ...(existingData ? {} : { createdAt: new Date().toISOString() }),
        // Preserve any other existing data
        ...existingData
      };

      // Important: The spread of existingData is after the new fields
      // This ensures we don't overwrite any existing values

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
      const displayName = username || getDefaultUsername(email);

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
          <button onClick={handleSignOut} className="mt-2 w-full bg-gray-700 text-white px-4 py-2 rounded-lg active:bg-red-300 hover:text-red-700">
            Sign Out
          </button>
        </div>
      ) : (
        <div className="flex-col space-y-10 py-10">
          <div className="flex-col text-white">
            <h2 className="flex text-xl py-2 md:py-0">
              Welcome to GEMA!
            </h2>

            <button onClick={handleGoogleLogin} className="mt-2 w-full bg-gray-700 text-white flex items-center justify-center px-4 py-2 rounded-lg drop-shadow-lg active:bg-red-200 active:bg-opacity-65 active:text-red-700 active:text-bold">
              <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24">
                <g fill="none" fillRule="evenodd">
                  <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path>
                  <path fill="currentColor" d="M12 5.5a6.5 6.5 0 1 0 6.326 8H13a1.5 1.5 0 0 1 0-3h7a1.5 1.5 0 0 1 1.5 1.5a9.5 9.5 0 1 1-2.801-6.736a1.5 1.5 0 1 1-2.116 2.127A6.48 6.48 0 0 0 12 5.5"></path>
                </g>
              </svg>
              <span className='pl-2'>Sign in with Google</span>
            </button>

            <button onClick={handleFacebookLogin} className="mt-2 w-full bg-gray-700 text-white flex items-center justify-center px-4 py-2 rounded-lg drop-shadow-lg active:bg-blue-300 active:bg-opacity-65 active:text-blue-600 active:text-bold">
              <svg xmlns="http://www.w3.org/2000/svg" width="1.75em" height="1.75em" viewBox="0 0 24 24">
	              <g fill="none">
		            <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path>
		            <path fill="currentColor" d="M13.5 21.888C18.311 21.164 22 17.013 22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 5.013 3.689 9.165 8.5 9.888V15H9a1.5 1.5 0 0 1 0-3h1.5v-2A3.5 3.5 0 0 1 14 6.5h.5a1.5 1.5 0 0 1 0 3H14a.5.5 0 0 0-.5.5v2H15a1.5 1.5 0 0 1 0 3h-1.5z"></path>
	              </g>
              </svg>
              <span className='pl-2'>
                Sign in with Facebook
              </span>
            </button>
          </div>

          <div className="flex space-x-2">
            <hr className="w-full border-t border-gray-700 my-4" />
            <span className="flex text-gray-500 text-sm items-center justify-center">
              alternatively
            </span>
            <hr className="w-full border-t border-gray-700 my-4" />
          </div>

          <div className="flex-col bg-gray-950  outline-1 outline-gray-700 active:outline-purple-800 rounded-xl w-full h-full p-4 space-y-2">
            {/* Temporarily disabled email sign-up input fields
            {isSignUp && (
              <div>
                <span className="font-white font-sm">Username</span>
                <input
                  type="text"
                  placeholder=""
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex w-full p-2 rounded-lg text-black text-sm  outline-2 outline-gray-700 focus:outline-purple-400"
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
                className="flex w-full p-2 rounded-lg text-white text-sm outline-none bg-gray-700 drop-shadow-lg"
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
                className="flex w-full p-2 rounded-lg text-white text-sm outline-none bg-gray-700 drop-shadow-lg"
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
                  className="flex w-full p-2 rounded-lg text-black text-sm  outline-2 outline-gray-700 focus:outline-purple-400"
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
                <div>
                  <button disabled className="p-2 text-center bg-gray-700 w-full rounded-lg cursor-not-allowed">
                    Sign in
                  </button>
                  <p className="text-yellow-500 text-sm mt-2 text-center">
                    Signing in using email is currently disabled. Please use Google or Facebook to sign in.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-2 text-white text-sm justify-center">
            <span className="text-center">
              {isSignUp ? "Already a user?" : "New to the app?"}
            </span>

            <button onClick={toggleAuthMode} className="bg-opacity-0 text-center text-purple-800 active:text-white">
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
