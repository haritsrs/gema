"use client";

import "./globals.css";
import Sidebar from '../components/sidebar';
import AuthSidebar from '../components/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase.js';
import localFont from "next/font/local";
import { useState, useEffect } from 'react';
import { LoginIcon, LogoutIcon, CloseIcon, ProfilePlaceholder } from "@/icons";

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
        <div className="fixed w-screen h-max top-0 p-4 flex items-center justify-between bg-gray-950 border border-b-1 border-gray-800 z-40">
          <a href="/profile">
            <img src="/img/logo.png" alt="GEMA Logo" className="w-50 h-8" />
          </a>

          <button onClick={() => setIsVisible(true)}
            className="flex items-center rounded-lg hover:bg-purple-500 fill-gray-400 hover:fill-purple-900">
            {/* Display logout/login button and profile picture */}
            <div className="w-max h-max mx-2">
              {currentUser ? (
                <LogoutIcon className="text-3xl" />) : (
                <LoginIcon className="text-3xl" />)}
            </div>

            {/* Profile picture or placeholder */}
            <div className="w-10 h-10 mr-2">
              {currentUser ? (
                <img
                  src={currentUser.photoURL}
                  alt="User Profile"
                  className="w-full h-full rounded-full"
                />
              ) : (
                <ProfilePlaceholder className="w-full h-full rounded-full" />
              )}
            </div>
          </button>
        </div>

        {isVisible && (
          <div className="fixed flex z-50 h-screen w-screen bg-gray-950 bg-opacity-85 text-white p-4 justify-center">
            <div className="relative flex-col w-[98%] h-[98%] max-w-sm bg-gray-900 rounded-xl items-center overflow-y-auto">
              <button className="absolute top-2 right-2" onClick={toggleVisibility}>
                <CloseIcon className="fill-gray-400 hover:fill-purple-900 text-xl" />
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
