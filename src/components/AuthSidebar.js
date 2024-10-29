"use client";
// menggunakan client side

// import statement
import { useState, useEffect } from 'react';
import { getAuth, signInWithPopup, signInAnonymously, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../firebase';

// fungsi sidebar
export default function AuthSidebar() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // New state for username
  const [isSignUp, setIsSignUp] = useState(false);

// fungsi authentikasi
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

// fungsi login dengan google
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

// fungsi login sebagai tamu
  const handleAnonymousLogin = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Error signing in anonymously: ", error);
    }
  };

// fungsi login dengan email
  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error signing in with Email: ", error);
    }
  };

// fungsi daftar dengan email
  const handleEmailSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: username
      });


      console.log("User signed up:", user);
  } catch (error) {
    console.error("Error signing up with Email: ", error);
  }
};

// fungsi keluar
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
  };

// jsx authSidebar
  return (
    <div className="mx-[5%] p-4 md:mx-0 rounded-lg">
      {user ? (
        <div>
          <h2 className="text-xl text-white">Selamat Datang, {user.displayName || 'User'}!</h2>
          <button onClick={handleSignOut} className="mt-2 w-full bg-purple-800 text-white px-4 py-2 rounded-lg hover:bg-red-300 hover:text-red-700">
            Keluar
          </button>
        </div>
      ) : (
        <div className="flex-col space-y-10 py-10">

          <div className="flex-col">
            <h2 className="flex text-xl text-white py-2 md:py-0">
              Selamat datang di GEMA!
            </h2>
            
            <button onClick={handleGoogleLogin} className="mt-2 w-full bg-gray-950 text-white flex items-center justify-center px-4 py-2 rounded-lg outline outline-1 outline-gray-700 hover:bg-purple-500 hover:bg-opacity-30 hover:outline-purple-800">
              Masuk Dengan Google
            </button>

            <button onClick={handleAnonymousLogin} className="mt-2 w-full bg-gray-950 text-white flex items-center justify-center px-4 py-2 rounded-lg outline outline-1 outline-gray-700 hover:bg-purple-500 hover:bg-opacity-30 hover:outline-purple-800">
              Masuk Sebagai Tamu
            </button>
          </div>

          <div className="flex space-x-2">
            <hr className="w-full border-t border-gray-700 my-4" />
            <span className="flex text-gray-500 text-sm items-center justify-center">
              Atau
            </span>
            <hr className="w-full border-t border-gray-700 my-4" />
          </div>

          <div className="flex-col bg-gray-950 outline outline-1 outline-gray-700 hover:outline-purple-800 rounded-xl w-full h-full p-4 space-y-2">
            {isSignUp && (
              <div>
                <span className="font-white font-sm">Pengguna</span>
                <input
                  type="text"
                  placeholder=""
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex w-full p-2 rounded-lg text-black text-sm outline outline-2 outline-gray-700 focus:outline-purple-400"
                />
              </div>
            )}
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
              <span className="font-white font-sm">Kata Sandi</span>
              <input
                type="password"
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex w-full p-2 rounded-lg text-black text-sm outline outline-2 outline-gray-700 focus:outline-purple-400"
              />
            </div>
            
            <div className="py-4 items-center justify-center">
              {isSignUp ? (
                <button onClick={handleEmailSignUp} className="p-2 text-center bg-purple-800 w-full rounded-lg hover:bg-purple-300 hover:text-purple-800">
                  Daftar
                </button>
              ) : (
                <button onClick={handleEmailLogin} className="p-2 text-center bg-purple-800 w-full rounded-lg hover:bg-purple-300 hover:text-purple-800">
                  Masuk
                </button>
              )}
            </div>
          </div>

          <div className="flex space-x-2 text-white text-sm justify-center">
            <span className="text-center">
              {isSignUp ? "Sudah menjadi pengguna?" : "Baru di GEMA?"}
            </span>

            <button onClick={toggleAuthMode} className="bg-opacity-0 text-center text-purple-800 hover:text-white">
              {isSignUp ? "Masuk" : "Daftar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
