"use client";

import Head from "next/head";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faHeart, faRetweet, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { faComment as farComment } from '@fortawesome/free-regular-svg-icons';
import localFont from "next/font/local";
import "./globals.css";
import { useState, useEffect } from 'react';
import { db } from '../../firebase.js';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';


// Importing custom fonts
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

export default function RootLayout() {
  const [postContent, setPostContent] = useState('');
  const [posts, setPosts] = useState([]);
  
  const fetchPosts = async () => {
    const querySnapshot = await getDocs(collection(db, 'posts'));
    const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPosts(postsData);
    const postsCollection = collection(db, 'posts');
    const postsSnapshot = await getDocs(postsCollection);
    const postsList = postsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPosts(postsList);

  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (postContent.trim() === '') return;
    const newPost = {
      content: postContent,
      createdAt: Timestamp.fromDate(new Date()),
    };
    try {
      
      await addDoc(collection(db, 'posts'), newPost); // Add new post to Firestore
      setPostContent(''); // Clear input field
      fetchPosts(); // Fetch posts again to update the displayed list
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return "Unknown"; // Return "Unknown" if undefined
    const now = new Date();
    const secondsAgo = Math.floor((now - timestamp.toDate()) / 1000);
    
  
    if (secondsAgo < 60) {
      return `${secondsAgo}s ago`;
    } else if (secondsAgo < 3600) {
      const minutesAgo = Math.floor(secondsAgo / 60);
      return `${minutesAgo}m ago`;
    } else if (secondsAgo < 86400) {
      const hoursAgo = Math.floor(secondsAgo / 3600);
      return `${hoursAgo}h ago`;
    } else {
      const daysAgo = Math.floor(secondsAgo / 86400);
      return `${daysAgo}d ago`;
    }
  };

  return (
    <html lang="en">
      <head>
        <title>GEMA</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-gray-900 antialiased mx-16`}>
        <div className="flex">
          <main className="flex-grow p-6">
            <div className="flex min-h-screen bg-gray-900 text-white">
              {/* Main Content */}
              <div className="flex-1">
                <div className="mx-20 bg-gray-800 p-4 flex items-center justify-between">
                  <img src="/img/logo.png" alt="GEMA Logo" className="h-12" />
                  <FontAwesomeIcon icon={faUserCircle} className="text-white text-2xl w-16" />
                </div>
                <div className="p-4 space-y-4">
                  {/* Create a Post */}
                  <div className="container mx-auto p-4 ">
                    <h1 className="text-2xl font-bold mb-4">Create a Post</h1>
                    <form onSubmit={handleSubmit} className="mb-6">
                      <textarea
                        className="w-full text-black p-2 border rounded"
                        rows="4"
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="What's on your mind?"
                      />
                      <button type="submit" className="mt-2 px-12 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Post
                      </button>
                    </form>
                    <div>
        <h2 className="text-xl font-bold mb-2">Posts</h2>
        <ul>
          {posts.map(post => (
            <li key={post.id} className="mb-4 text-white p-4 bg-gray-800 rounded">
              <div>{post.content}</div>
              <div className="text-gray-500 text-sm mt-">
      {formatTimestamp(post.createdAt)} {/* Display the formatted timestamp */}
    </div>
  </li>
          ))}
        </ul>
      </div>      
                  </div>
  
                  {/* Example Posts */}
                  {/* Post 1 */}
                  <div className="bg-gray-800 p-4 rounded-lg mx-20">
                    <div className="flex items-center space-x-2">
                      <img src="https://placehold.co/40x40" alt="Profile picture of Statman Dave" className="rounded-full" />
                      <div>
                        <div className="font-bold">Statman Dave <span className="text-gray-500">@StatmanDave · 14h</span></div>
                        <div>Ruud van Nistelrooy has been booked in a Europa League game for the first time since 2010. 😉</div>
                      </div>
                    </div>
                    <img src="https://placehold.co/500x300" alt="Ruud van Nistelrooy in a football training outfit" className="mt-4 rounded-lg" />
                    <div className="flex justify-between text-gray-500 mt-2">
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={farComment} />
                        <span>2</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faRetweet} />
                        <span>46</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faHeart} />
                        <span>1.6K</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faChartBar} />
                        <span>34K</span>
                      </div>
                    </div>
                  </div>
  
                  {/* Post 2 */}
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <img src="https://placehold.co/40x40" alt="Profile picture of Denita_fit" className="rounded-full" />
                      <div>
                        <div className="font-bold">That mf is NOT real <span className="text-gray-500">@Denita_fit · 15h</span></div>
                        <div>So it finally happened. I asked someone "Hey, how are you?" as we normally do out of habit. They responded "not well actually"</div>
                        <div className="mt-2">I asked if they wanted to talk about it. They said "I think so" so I listened to a stranger, for 20 mins.</div>
                        <div className="mt-2">They gave me a big hug & thanked me after😊</div>
                      </div>
                    </div>
                    <div className="flex justify-between text-gray-500 mt-2">
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={farComment} />
                        <span>293</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faRetweet} />
                        <span>4.4K</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faHeart} />
                        <span>105K</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faChartBar} />
                        <span>942K</span>
                      </div>
                    </div>
                  </div>
  
                  {/* Post 3 */}
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <img src="https://placehold.co/40x40" alt="Profile picture of AbsoluteBruno" className="rounded-full" />
                      <div>
                        <div className="font-bold">AB <span className="text-gray-500">@AbsoluteBruno · 13h</span></div>
                        <div>Give Onana his flowers btw, saved us from complete embarrassment today</div>
                      </div>
                    </div>
                    <img src="https://placehold.co/500x300" alt="Onana in a football match" className="mt-4 rounded-lg" />
                    <div className="flex justify-between text-gray-500 mt-2">
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={farComment} />
                        <span>293</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faRetweet} />
                        <span>4.4K</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faHeart} />
                        <span>105K</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faChartBar} />
                        <span>942K</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
};