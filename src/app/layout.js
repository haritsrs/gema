"use client";

import "./globals.css";
import Sidebar from '../components/sidebar';
import AuthSidebar from '../components/AuthSidebar';
import localFont from "next/font/local";

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
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex min-h-screen">
          <div className="fixed top-0 left-0 h-full w-40 bg-purple-800 text-white p-4">
            <Sidebar />
          </div>

          <main className="ml-1/4 mr-1/4 w-1/2 p-6 bg-gray-900 text-white min-h-screen">
            {children}
          </main>

          <div className="fixed top-0 right-0 h-full w-40 bg-purple-900 text-white p-4">
            <AuthSidebar />
          </div>
        </div>
      </body>
    </html>
  );
}
