"use client";

import { useState, useEffect } from 'react';
import { getAuth, signInWithPopup, signInAnonymously, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword} from 'firebase/auth';
import { auth } from '../../firebase';


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
          <button onClick={handleSignOut} className="mt-2 w-full bg-purple-800  text-white px-4 py-2 rounded-lg hover:bg-red-300 hover:text-red-700">
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
              <svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24" className="mr-4"><path fill="currentColor" d="M12.222 5.977a5.4 5.4 0 0 1 3.823 1.496l2.868-2.868A9.6 9.6 0 0 0 12.222 2a10 10 0 0 0-8.937 5.51l3.341 2.59a5.96 5.96 0 0 1 5.596-4.123" opacity={0.7}></path><path fill="currentColor" d="M3.285 7.51a10.01 10.01 0 0 0 0 8.98l3.341-2.59a5.9 5.9 0 0 1 0-3.8z"></path><path fill="currentColor" d="M15.608 17.068A6.033 6.033 0 0 1 6.626 13.9l-3.34 2.59A10 10 0 0 0 12.221 22a9.55 9.55 0 0 0 6.618-2.423z" opacity={0.5}></path><path fill="currentColor" d="M21.64 10.182h-9.418v3.868h5.382a4.6 4.6 0 0 1-1.996 3.018l-.01.006l.01-.006l3.232 2.51a9.75 9.75 0 0 0 2.982-7.35q0-1.032-.182-2.046" opacity={0.25}></path></svg>
              Sign in with Google
            </button>

            <button onClick={handleAnonymousLogin} className="mt-2 w-full bg-gray-950 text-white flex items-center justify-center px-4 py-2 rounded-lg outline outline-1 outline-gray-700 hover:bg-purple-500 hover:bg-opacity-30 hover:outline-purple-800">
              <svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24" className="mr-4"><g fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M21 12V6.719c0-2.19 0-3.285-.707-3.884c-.707-.6-1.788-.42-3.95-.059l-1.055.176c-1.64.273-2.46.41-3.288.41s-1.648-.137-3.288-.41l-1.054-.176c-2.162-.36-3.243-.54-3.95.059S3 4.529 3 6.719V12c0 5.49 4.239 8.155 6.899 9.286c.721.307 1.082.46 2.101.46c1.02 0 1.38-.153 2.101-.46C16.761 20.155 21 17.49 21 12Z" opacity={0.5}></path><path strokeLinecap="round" d="M6.5 9c.291-.583 1.077-1 2-1s1.709.417 2 1m3 0c.291-.583 1.077-1 2-1s1.709.417 2 1m-9 5s1.05 1 3.5 1s3.5-1 3.5-1"></path></g></svg>
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
                <button onClick={handleEmailSignUp} className="p-2 text-center bg-purple-800 w-full rounded-lg hover:bg-purple-300 hover:text-purple-800">
                  Sign Up
                </button>
              ) : (
                <button onClick={handleEmailLogin} className="p-2 text-center bg-purple-800 w-full rounded-lg hover:bg-purple-300 hover:text-purple-800">
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

