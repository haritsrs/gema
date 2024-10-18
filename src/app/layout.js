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

          <aside className="hidden md:block fixed top-0 left-0 h-full w-40 bg-purple-800 text-white p-4">
            <Sidebar />
          </aside>
          

          <div className="w-full bg-gray-900 justify-center flex-grow overflow-y-auto mb-10 md:mb-0 md:mx-[5%]">
             <div className="md:mx-[18%] p-4 flex items-center justify-between">
                <img src="/img/logo.png" alt="GEMA Logo" className="w-50 h-8" />

                <FontAwesomeIcon icon={faUserCircle} className="hidden md:block text-white h-16 text-2xl" />

                <button className="md:hidden text-white text-3xl hover:text-purple-800" onClick={toggleVisibility}>
                  <FontAwesomeIcon icon={faUserCircle} className="md:hidden" />
                </button>
             </div>

            <div className="md:mx-4 flex-col md:flex">
                {isVisible && (
                <AuthSidebar />
                )}
                {children}
            </div>

          </div>

          <aside className="hidden md:block fixed top-0 right-0 h-full w-40 bg-gray-950 text-white p-4">
            <AuthSidebar />
          </aside>
         

          {/* Mobile Navbar */}
          <div className="md:hidden fixed bg-purple-800 bottom-0 left-0 w-screen text-white p-2">
            <Sidebar />
          </div> 

        </div>
      </body>
    </html>
  );
}
