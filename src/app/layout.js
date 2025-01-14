"use client";

import "./globals.css";
import Sidebar from '../components/sidebar';
import AuthSidebar from '../components/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase.js';
import Link from 'next/link';
import Image from "next/legacy/image";
import localFont from "next/font/local";
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const inter = localFont({
  src: "./fonts/Inter-VariableFont_opsz,wght.ttf",
  variable: "--font-inter",
  weight: "100 900",
});

const routeTitles = {
  '/': 'Home',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
  '/search': 'Search',
  '/profile': 'Profile',
  '/following': 'Following',
  '/about-me': 'About Me',

};

export default function RootLayout({ children }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const pageTitle = routeTitles[pathname] || 'Page';
    document.title = `${pageTitle} / GEMA`;
  }, [pathname]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <html lang="en">
      <head>
        {}
        <title>GEMA</title>
      </head>
      <body className={`${inter.variable} antialiased bg-gradient-to-br from-gray-900 via-gray-950 to-black`}>
        {}
        <div className="fixed w-screen top-0 p-2 flex items-center justify-between 
          bg-gray-900/85 backdrop-blur-sm border border-white/10 
          shadow-lg z-40 transition-all duration-300 
          hover:bg-gray-800/85 hover:border-white/15">
          <Link href="/" className="hover:scale-105 transition-transform">
            <Image
              src="/img/logo.png"
              alt="GEMA Logo"
              objectFit="contain"
              width={220}
              height={32}
            />
          </Link>

          <div className="flex items-center justify-center mr-2">
            <button
              className="w-max h-max rounded-2xl fill-gray-400 
              active:scale-95 transition-all duration-200 
              hover:bg-white/10 p-1 rounded-full"
              onClick={() => setIsVisible(true)}
            >
              <div className="flex justify-end items-center space-x-4 m-1">
                {currentUser ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="1.75em" height="1.75em" viewBox="0 0 24 24" className="hover:fill-purple-500 transition-colors">
                    {}
                    <path d="M15 2h-1c-2.828 0-4.243 0-5.121.879C8 3.757 8 5.172 8 8v8c0 2.828 0 4.243.879 5.121C9.757 22 11.172 22 14 22h1c2.828 0 4.243 0 5.121-.879C21 20.243 21 18.828 21 16V8c0-2.828 0-4.243-.879-5.121C19.243 2 17.828 2 15 2" opacity={0.6}></path>
                    <path d="M8 8c0-1.538 0-2.657.141-3.5H8c-2.357 0-3.536 0-4.268.732S3 7.143 3 9.5v5c0 2.357 0 3.535.732 4.268S5.643 19.5 8 19.5h.141C8 18.657 8 17.538 8 16z" opacity={0.4}></path>
                    <path fillRule="evenodd" d="M4.47 11.47a.75.75 0 0 0 0 1.06l2 2a.75.75 0 0 0 1.06-1.06l-.72-.72H14a.75.75 0 0 0 0-1.5H6.81l.72-.72a.75.75 0 1 0-1.06-1.06z" clipRule="evenodd"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="1.75em" height="1.75em" viewBox="0 0 24 24" className="hover:fill-purple-500 transition-colors">
                    {}
                  </svg>
                )}

                <Image
                  src={currentUser ? currentUser.photoURL : "/img/placehold.png"}
                  alt="User Profile"
                  objectFit="cover"
                  width={40}
                  height={40}
                  className="rounded-full transition-all duration-300 
                    hover:scale-105"
                />
              </div>
            </button>
          </div>
        </div>

        {}
        {isVisible && (
          <div className="fixed flex z-50 h-screen w-screen 
            bg-black/60 backdrop-blur-sm 
            text-white p-4 justify-center items-center 
            animate-fade-in">
            <div className="relative flex-col w-[98%] h-[98%] max-w-sm 
              bg-gray-900/85 backdrop-blur-sm 
              rounded-xl border border-gray-500/10 
              shadow-2xl overflow-hidden 
              transition-all duration-300">
              <button
                className="absolute top-2 right-2 
                hover:bg-white/10 rounded-full p-1 
                transition-all duration-200"
                onClick={toggleVisibility}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24">
                  <g fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <circle cx={12} cy={12} r={10} opacity={0.5}></circle>
                    <path strokeLinecap="round" d="m14.5 9.5l-5 5m0-5l5 5"></path>
                  </g>
                </svg>
              </button>
              <AuthSidebar />
            </div>
          </div>
        )}

        {}
        <div className="flex min-h-screen">
          {}
          <div className="hidden md:block fixed top-16 h-full w-max 
            bg-gray-900/85 backdrop-blur-sm 
            border border-white/10 
            rounded-r-xl 
            hover:bg-gray-800/30 
            transition-all duration-300 
            text-white px-4 z-30">
            <Sidebar />
          </div>

          {}
          <div className="flex flex-col grow items-center py-16 
            justify-center overflow-y-auto md:pb-0 
            space-y-6">
            {children}
          </div>

          {}
          <div className="md:hidden fixed 
            bg-gray-800/85 backdrop-blur-sm 
            bottom-0 left-0 w-screen 
            border-t border-white/10 
            rounded-t-xl 
            h-max items-center text-white p-2 transition-all duration-300">
            <Sidebar />
          </div>
        </div>
      </body>
    </html>
  );
}
