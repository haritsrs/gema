import React from 'react';
import Image from "next/legacy/image";
import localFont from "next/font/local";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const NotificationItem = ({ type, user, content, timestamp, read, userImage }) => {
  const getNotificationIcon = () => {
    switch (type) {
      case 'like':
        return (
          <div className="p-2 bg-purple-500 bg-opacity-20 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-500" viewBox="0 0 24 24">
              <path fill="currentColor" d="M8.106 18.247C5.298 16.083 2 13.542 2 9.137C2 4.274 7.5.825 12 5.501l2 1.998a.75.75 0 0 0 1.06-1.06l-1.93-1.933C17.369 1.403 22 4.675 22 9.137c0 4.405-3.298 6.946-6.106 9.11q-.44.337-.856.664C14 19.729 13 20.5 12 20.5s-2-.77-3.038-1.59q-.417-.326-.856-.663" />
            </svg>
          </div>
        );
      case 'comment':
        return (
          <div className="p-2 bg-blue-500 bg-opacity-20 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" viewBox="0 0 24 24">
              <path fill="currentColor" d="m13.629 20.472l-.542.916c-.483.816-1.69.816-2.174 0l-.542-.916c-.42-.71-.63-1.066-.968-1.262c-.338-.197-.763-.204-1.613-.219c-1.256-.021-2.043-.098-2.703-.372a5 5 0 0 1-2.706-2.706C2 14.995 2 13.83 2 11.5v-1c0-3.273 0-4.91.737-6.112a5 5 0 0 1 1.65-1.651C5.59 2 7.228 2 10.5 2h3c3.273 0 4.91 0 6.113.737a5 5 0 0 1 1.65 1.65C22 5.59 22 7.228 22 10.5v1c0 2.33 0 3.495-.38 4.413a5 5 0 0 1-2.707 2.706c-.66.274-1.447.35-2.703.372c-.85.015-1.275.022-1.613.219c-.338.196-.548.551-.968 1.262" />
            </svg>
          </div>
        );
      case 'follow':
        return (
          <div className="p-2 bg-green-500 bg-opacity-20 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5s-5 2.24-5 5s2.24 5 5 5m0-8c1.66 0 3 1.34 3 3s-1.34 3-3 3s-3-1.34-3-3s1.34-3 3-3m0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4m0 2c2.67 0 6 1.34 6 2h-12c0-.66 3.33-2 6-2" />
            </svg>
          </div>
        );
      case 'mention':
        return (
          <div className="p-2 bg-yellow-500 bg-opacity-20 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h5v-2h-5c-4.34 0-8-3.66-8-8s3.66-8 8-8s8 3.66 8 8v1.43c0 .79-.71 1.57-1.5 1.57s-1.5-.78-1.5-1.57V12c0-2.76-2.24-5-5-5s-5 2.24-5 5s2.24 5 5 5c1.38 0 2.64-.56 3.54-1.47c.65.89 1.77 1.47 2.96 1.47c1.97 0 3.5-1.6 3.5-3.57V12c0-5.52-4.48-10-10-10m0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3s3 1.34 3 3s-1.34 3-3 3" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex items-start space-x-4 p-4 ${read ? 'bg-gray-800' : 'bg-gray-800 border-l-4 border-purple-500'} rounded-lg transition-all duration-200 hover:bg-gray-700`}>
      <div className="w-10 h-10 rounded-full overflow-hidden">
  <Image
    src={userImage || '/default-avatar.png'}
    alt={`${user}'s profile`}
    layout="fill"
    objectFit="cover"
  />
</div>
      {getNotificationIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-white">
          <span className="font-semibold">{user}</span>{' '}
          {content}
        </p>
        <p className="text-sm text-gray-400 mt-1">{timestamp}</p>
      </div>
    </div>
  );
};

export default function NotificationsPage() {
  // Sample notifications data
  const notifications = [
    {
      id: 1,
      type: 'like',
      user: 'Sarah Chen',
      content: 'liked your post "Building a React Component Library"',
      timestamp: 'Just now',
      read: false,
      src: '/img/placehold.png'
    },
    {
      id: 2,
      type: 'comment',
      user: 'Alex Thompson',
      content: 'commented on your post: "This is exactly what I was looking for!"',
      timestamp: '5m ago',
      read: false,
      src: '/img/placehold.png'
    },
    {
      id: 3,
      type: 'follow',
      user: 'Maria Garcia',
      content: 'started following you',
      timestamp: '1h ago',
      read: true,
      src: '/img/placehold.png'
    },
    {
      id: 4,
      type: 'mention',
      user: 'David Kim',
      content: 'mentioned you in a comment: "@username Great explanation!"',
      timestamp: '2h ago',
      read: true,
      src: '/img/placehold.png'
    },
    {
      id: 5,
      type: 'like',
      user: 'Emma Wilson',
      content: 'and 5 others liked your post',
      timestamp: '3h ago',
      read: true,
      src: '/img/placehold.png'
    }
  ];

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen w-full bg-gray-900`}>
      <div className="max-w-2xl mx-auto px-4">
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Notifications</h2>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
              Mark all as read
            </button>
          </div>

          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                type={notification.type}
                user={notification.user}
                content={notification.content}
                timestamp={notification.timestamp}
                read={notification.read}
                userImage={notification.userImage}
              />
            ))}
          </div>

          <div className="mt-8 text-center">
            <button className="w-full max-w-md py-3 px-4 rounded-lg text-white font-medium bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-all duration-200">
              Load More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}