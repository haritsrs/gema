"use client"; 

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faHeart, faRetweet, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { faComment as farComment } from '@fortawesome/free-regular-svg-icons';
import { useState, useEffect } from 'react';
import { db } from '../../firebase.js';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import localFont from "next/font/local";

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
  const [postContent, setPostContent] = useState('');
  const [posts, setPosts] = useState([]);

  // Fetch posts from Firestore
  const fetchPosts = async () => {
    const querySnapshot = await getDocs(collection(db, 'posts'));
    const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPosts(postsData);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle new post submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (postContent.trim() === '') return;

    const newPost = {
      content: postContent,
      createdAt: Timestamp.fromDate(new Date()),
    };

    try {
      await addDoc(collection(db, 'posts'), newPost);
      setPostContent('');
      fetchPosts();
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  }

  // Format Firestore timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return "Unknown";
    const now = new Date();
    const secondsAgo = Math.floor((now - timestamp.toDate()) / 1000);

    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
    return `${Math.floor(secondsAgo / 86400)}d ago`;
  };

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased md:mx-40`}>
      <div className="flex">
        <main className="flex md:justify-center">
          <div className="flex min-h-screen text-white">
            <div className="flex-1">

              {/* Post creation form */}
              <div className="p-4 space-y-4">
                <div className="container mx-auto p-4">
                  <h1 className="text-2xl font-bold mb-4">Create a Post</h1>
                  <form onSubmit={handleSubmit} className="mb-6">
                    <textarea
                      className="w-full text-black p-2 border rounded-lg"
                      rows="4"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="What's on your mind?"
                    />
                    <button type="submit" className="mt-2 px-12 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-900">
                      Post
                    </button>
                  </form>

                  {/* Posts List */}
                  <div>
                    <h2 className="text-xl font-bold mb-2">Posts</h2>
                    <ul>
                      {posts.map(post => (
                        <li key={post.id} className="mb-4 text-white p-4 bg-gray-800 rounded-lg">
                          <div>{post.content}</div>
                          <div className="text-gray-500 text-sm mt-2">
                            {formatTimestamp(post.createdAt)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Example Post 1 */}
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

                {/* Example Post 2 */}
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

                {/* Example Post 3 */}
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
    </div>
  );
}

