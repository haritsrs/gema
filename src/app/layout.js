"use client";

import "./globals.css";
import Sidebar from '../components/sidebar';
import AuthSidebar from '../components/AuthSidebar';
import localFont from "next/font/local";
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900`}>

         <div className="fixed w-screen top-0 p-4 flex items-center justify-between bg-gray-950 border border-b-1 border-gray-800 z-40">
            <img src="/img/logo.png" alt="GEMA Logo" className="w-50 h-8" />

            <button className="text-white text-3xl hover:text-purple-800" onClick={toggleVisibility}>
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="white" d="M15 2h-1c-2.828 0-4.243 0-5.121.879C8 3.757 8 5.172 8 8v8c0 2.828 0 4.243.879 5.121C9.757 22 11.172 22 14 22h1c2.828 0 4.243 0 5.121-.879C21 20.243 21 18.828 21 16V8c0-2.828 0-4.243-.879-5.121C19.243 2 17.828 2 15 2" opacity={0.6}></path><path fill="white" d="M8 8c0-1.538 0-2.657.141-3.5H8c-2.357 0-3.536 0-4.268.732S3 7.143 3 9.5v5c0 2.357 0 3.535.732 4.268S5.643 19.5 8 19.5h.141C8 18.657 8 17.538 8 16z" opacity={0.4}></path><path fill="white" fillRule="evenodd" d="M14.53 11.47a.75.75 0 0 1 0 1.06l-2 2a.75.75 0 1 1-1.06-1.06l.72-.72H5a.75.75 0 0 1 0-1.5h7.19l-.72-.72a.75.75 0 1 1 1.06-1.06z" clipRule="evenodd"></path></svg>
            </button>
        </div>

        {isVisible &&(
            <div className="fixed flex z-50 h-screen w-screen bg-gray-950 bg-opacity-85 text-white p-4 justify-center">

              <div className="relative flex-col w-[98%] h-[98%] max-w-sm bg-gray-900 rounded-xl items-center overflow-y-auto">

                <button className="absolute top-2 right-2" onClick={toggleVisibility}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth={1.5}><circle cx={12} cy={12} r={10} opacity={0.5}></circle><path strokeLinecap="round" d="m14.5 9.5l-5 5m0-5l5 5"></path></g></svg>
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
