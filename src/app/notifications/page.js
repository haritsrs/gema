"use client";

import React from 'react';
import localFont from "next/font/local";
import { useNotifications } from "../../hooks/useNotifications";
import { useAuth } from '../../hooks/useAuth';

const inter = localFont({
  src: "../fonts/Inter-VariableFont_opsz,wght.ttf",
  variable: "--font-inter",
  weight: "100 900",
});

export default function NotificationsPage() {
  const { user: currentUser, loading } = useAuth();
  const { notifications, clearNotifications } = useNotifications(currentUser?.uid);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Please login to view notifications.</p>
      </div>
    );
  }

  return (
    <div className={`${inter.variable} antialiased min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4`}>
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white mt-4">Notifications</h1>
          {notifications.length > 0 && (
            <button
              onClick={() => clearNotifications(currentUser.uid)}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
                text-white px-4 py-2 rounded-xl transition-all duration-300 ease-in-out 
                shadow-lg hover:shadow-red-500/20"
            >
              Clear All
            </button>
          )}
        </div>

        <ul className="space-y-4">
          {notifications.length === 0 ? (
            <li className="text-gray-400 text-center py-8">
              No notifications to display
            </li>
          ) : (
            notifications.map((notification) => (
              <li 
                key={notification.id} 
                className="bg-gradient-to-br from-purple-900/10 via-gray-800/20 to-blue-900/10 
                  backdrop-blur-sm border border-white/10 rounded-2xl p-4 
                  shadow-xl hover:from-purple-900/15 hover:via-gray-800/25 hover:to-blue-900/15 
                  transition-all duration-300 ease-in-out text-white"
              >
                {notification.message}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}