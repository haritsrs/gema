"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faRetweet, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { faComment as farComment } from '@fortawesome/free-regular-svg-icons';
import { useState, useEffect } from 'react';
import { db } from '../../firebase.js';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import localFont from "next/font/local";
import Posting from '../components/posting';

// Load custom fonts
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

export default function Page() {
  const [posts, setPosts] = useState([]);

  // Fetch posts from Firestore
  const fetchPosts = async () => {
    const querySnapshot = await getDocs(collection(db, 'posts'));
    const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPosts(postsData);
  };

  const handleLike = async (postId, currentLikes) => {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, { likes: currentLikes + 1 });
    fetchPosts();
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return "Unknown";
    const now = new Date();
    const secondsAgo = Math.floor((now - timestamp.toDate()) / 1000);

    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
    return `${Math.floor(secondsAgo / 86400)}d ago`;
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased flex justify-center`}>
      <div className="flex flex-col w-full md:w-2/3 max-w-3xl p-4"> {/* Updated max width */}
        <div className="flex flex-col min-h-screen text-white">
          <div className="flex-1">
            <div className="space-y-4">
              <Posting onPostCreated={fetchPosts} />

              <h2 className="text-xl font-bold mb-2">Posts</h2>
              <ul>
                {posts.map(post => (
                  <li key={post.id} className="mb-4 text-white p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <img
                        src={post.profilePicture || 'https://placehold.co/40x40'}
                        alt={`${post.username || 'User'}'s profile`}
                        className="rounded-full"
                      />
                      <div>
                        <div className="font-bold">
                          {post.username || 'User'}{' '}
                          <span className="text-gray-500">· {formatTimestamp(post.createdAt)}</span>
                        </div>
                        <div>{post.content}</div>
                      </div>
                    </div>
                    <div className="flex justify-between text-gray-500 mt-2">
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={farComment} />
                        <span>Comment</span>
                      </div>
                      <div className="flex items-center space-x-1 cursor-pointer" onClick={() => handleLike(post.id, post.likes)}>
                        <FontAwesomeIcon icon={faHeart} />
                        <span>{post.likes || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faRetweet} />
                        <span>Share</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
