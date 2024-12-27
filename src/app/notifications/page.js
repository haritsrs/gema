"use client";

import React from 'react';
import { useNotificationSystem } from "../../hooks/useNotificationSystem";


export default function NotificationsPage(){
  const { notifications, clearNotifications } = useNotificationSystem();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <button
        onClick={clearNotifications}
        className="bg-red-500 text-white px-4 py-2 rounded mb-4"
      >
        Clear Notifications
      </button>
      <ul className="space-y-4">
        {notifications.length === 0 ? (
          <li>No notifications to display</li>
        ) : (
          notifications.map((notification) => (
            <li key={notification.id} className="p-4 bg-gray-100 rounded shadow-md">
              {notification.content}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

