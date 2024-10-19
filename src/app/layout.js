"use client";

import "./globals.css";
import Sidebar from '../components/sidebar';
import AuthSidebar from '../components/AuthSidebar';
import localFont from "next/font/local";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

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

  {/* Mobile Drop-down menu visibility */}

  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>


        <div className="flex min-h-screen">

          <aside className="hidden md:block fixed top-0 left-0 h-full w-max bg-purple-800 text-white p-4">
            <Sidebar />
          </aside>
          

          <div className="parent-div flex-col grow bg-gray-900 items-center justify-center overflow-y-auto mb-10 md:mb-0 md:pl-40">
             <div className="p-4 flex items-center justify-between">
                <img src="/img/logo.png" alt="GEMA Logo" className="w-50 h-8" />

                <button className="text-white text-3xl hover:text-purple-800" onClick={toggleVisibility}>
                  <FontAwesomeIcon icon={faUserCircle} />
                </button>
             </div>

            {children}

          </div>

          {isVisible &&(
            <div className="fixed flex z-50 fixed h-screen w-screen bg-gray-950 bg-opacity-85 text-white p-4 justify-center">

              <div className="relative flex-col w-[98%] h-[98%] max-w-sm bg-gray-900 rounded-xl items-center overflow-y-auto">

                <button className="absolute text-bold text-white top-2 right-2 w-8 h-8 rounded-xl bg-gray-800" onClick={toggleVisibility}>
                  x
                </button>

                <AuthSidebar />

              </div>


            </div>
          )}
         

          {/* Mobile Navbar */}
          <div className="md:hidden fixed bg-purple-800 bottom-0 left-0 w-screen text-white p-2">
            <Sidebar />
          </div> 

        </div>
      </body>
    </html>
  );
}
