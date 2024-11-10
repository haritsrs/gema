"use client";

import "./globals.css";
import Sidebar from '../components/sidebar';
import AuthSidebar from '../components/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase.js';
import localFont from "next/font/local";
import { useState, useEffect } from 'react';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({ children }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Current user state

  // Authentication listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900`}>
        <div className="fixed w-screen top-0 p-4 flex items-center justify-between bg-gray-950 border border-b-1 border-gray-800 z-40">
        <a href="/profile">
          <img src="/img/logo.png" alt="GEMA Logo" className="w-50 h-8" />
          </a>

          <div className="flex items-center space-x-4">
            {/* Display logout/login button and profile picture */}
            <button className="text-white text-3xl hover:text-purple-800" onClick={() => setIsVisible(true)}>
              <img src="/icons/LogoutIcon.svg" alt="Logout Icon" width="32em" height="32em" />
            </button>

            {/* Profile picture or placeholder */}
            <img 
              src={currentUser ? currentUser.photoURL : "https://placehold.co/40x40"} // Use placeholder when logged out
              alt="User Profile" 
              className="w-8 h-8 rounded-full cursor-pointer"
              onClick={() => setIsVisible(true)}  // Show the logout confirmation or profile menu
            />
          </div>
        </div>

        {isVisible && (
          <div className="fixed flex z-50 h-screen w-screen bg-gray-950 bg-opacity-85 text-white p-4 justify-center">
            <div className="relative flex-col w-[98%] h-[98%] max-w-sm bg-gray-900 rounded-xl items-center overflow-y-auto">
              <button className="absolute top-2 right-2" onClick={toggleVisibility}>
                <img src="/icons/closeIcon.svg" alt="Close Icon" width="24" height="24" />  
              </button>
              <AuthSidebar />
            </div>
          </div>
        )}

        <div className="flex min-h-screen">
          <div className="hidden md:block fixed top-16 h-full w-max items-center justify-center bg-gray-950 outline outline-1 outline-gray-700 hover:outline-purple-800 text-white px-4 z-30">
            <Sidebar />
          </div>

          <div className="flex flex-col grow items-center py-16 justify-center overflow-y-auto md:pb-0">
            {children}
          </div>

          {/* Mobile Navbar */}
          <div className="md:hidden fixed bg-gray-900 bottom-0 left-0 w-screen h-max items-center text-white p-2 border border-t-1 border-gray-800">
            <Sidebar />
          </div>
        </div>
      </body>
    </html>
  );
}
