"use client";

import { useState, useEffect } from 'react';
import { getDatabase, ref, query, orderByChild, equalTo, get } from 'firebase/database';
import { auth } from '../../../firebase';
import localFont from "next/font/local";
import Link from 'next/link';

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const database = getDatabase();
      const userRef = ref(database, `users/${currentUser.uid}`);
      const userSnapshot = await get(userRef);
      
      setUserData(userSnapshot.val());

      const postsRef = query(
        ref(database, 'posts'),
        orderByChild('userId'),
        equalTo(currentUser.uid)
      );

      const postsSnapshot = await get(postsRef);
      const postsData = [];

      postsSnapshot.forEach(childSnapshot => {
        postsData.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });

      setUserPosts(postsData);
      setLoading(false);
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen w-full bg-gray-900 text-white`}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <img
            src={userData?.profilePicture || 'https://placehold.co/80x80'}
            alt={`${userData?.username}'s profile`}
            className="rounded-full w-20 h-20 mx-auto"
          />
          <h1 className="text-2xl font-bold">{userData?.username || 'User'}</h1>
          <p className="text-gray-400">{userData?.bio || "This user hasn't added a bio yet."}</p>
        </div>

        <h2 className="text-xl font-semibold mt-6">Your Posts</h2>
        <ul className="space-y-4 mt-4">
          {userPosts.map((post) => (
            <li key={post.id} className="p-4 bg-gray-800 rounded-lg">
              <Link href={`/posts/${post.id}`}>
                <div>
                  <div className="font-semibold">{post.content}</div>
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Post image"
                      className="mt-2 w-full h-auto rounded-lg"
                    />
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
