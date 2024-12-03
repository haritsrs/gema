"use client";

import { useState, useEffect } from 'react';
import { getDatabase, ref, query, orderByChild, onValue } from 'firebase/database';
import { auth } from '../../../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import localFont from "next/font/local";
import LoadingOverlay from '../../components/LoadingOverlay';
import Link from 'next/link';
import Image from 'next/image.js';
import PostDropdown from '../../components/PostDropdown';
import { usePostSystem } from '../../hooks/usePostSystem.js';
import { useImageDimensions } from '../../hooks/useImageDimensions';
import { useSharePost } from "../../hooks/useSharePost";

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

function useSearchPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const database = getDatabase();

  useEffect(() => {
    const postsRef = ref(database, 'posts');
    const postsQuery = query(postsRef, orderByChild('createdAt'));

    const handlePosts = (snapshot) => {
      if (!snapshot.exists()) {
        setLoading(false);
        return;
      }

      const postsData = [];
      snapshot.forEach((childSnapshot) => {
        postsData.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });

      setPosts(postsData.reverse());
      setLoading(false);
    };

    const unsubscribe = onValue(postsQuery, handlePosts);
    return () => unsubscribe();
  }, [database]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    const results = posts.filter(post => {
      const content = post.content?.toLowerCase() || '';
      const username = post.username?.toLowerCase() || '';
      const searchLower = searchTerm.toLowerCase();
      return content.includes(searchLower) || username.includes(searchLower);
    });

    setSearchResults(results);
  }, [searchTerm, posts]);

  return {
    posts,
    loading,
    searchResults,
    searchTerm,
    setSearchTerm
  };
}

export default function SearchPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const { imageDimensions, handleImageLoad } = useImageDimensions();
  const handleShare = useSharePost();
  const { formatTimestamp } = usePostSystem();
  const {
    loading,
    searchResults,
    searchTerm,
    setSearchTerm
  } = useSearchPosts();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen w-full bg-gray-900`}>
      <LoadingOverlay isLoading={loading} />

      {/* Search Header */}
      <div className="w-full p-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search posts..."
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <svg
              className="absolute left-3 top-2.5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {searchTerm.trim() === '' ? (
          <div className="text-gray-400 text-center py-8">
            Enter a search term to find posts
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No posts found matching &quot;{searchTerm}&quot;
          </div>
        ) : (
          <div>
            <h2 className="text-white text-xl mb-4">Search Results for &quot;{searchTerm}&quot;</h2>
            <ul className="space-y-4">
              {searchResults.map((post) => (
                <li key={post.id} className="text-white p-4 bg-gray-800 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={post.profilePicture || '/default-avatar.png'}
                        alt={`${post.username || 'User'}'s profile`}
                        width={40} // 10 * 4 = 40px
                        height={40}
                        objectFit="cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="font-bold">
                          {post.username || 'User'}{' '}
                          <span className="text-gray-500">· {formatTimestamp(post.createdAt)}</span>
                        </div>
                        {currentUser?.uid === post.userId && (
                          <PostDropdown
                            post={post}
                            currentUser={currentUser}
                          />
                        )}
                      </div>
                      <Link href={`/posts/${post.id}`}>
                        <div>{post.content}</div>
                        {post.imageUrl && (
                          <div className="mt-2 w-full h-auto overflow-hidden">
                            <Image
                              src={post.imageUrl}
                              alt="Post image"
                              loading="lazy"
                              width={imageDimensions[post.id]?.width || 500}
                              height={imageDimensions[post.id]?.height || 300}
                              onLoadingComplete={(result) => handleImageLoad(post.id, result)}
                              className="rounded-lg"
                            />
                          </div>
                        )}
                      </Link>
                    </div>
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between text-gray-300 mt-2">
                    <div className="flex mx-2">
                      {/* Like Count Display */}
                      <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-2 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24" className="fill-gray-400">
                          <path d="M8.106 18.247C5.298 16.083 2 13.542 2 9.137C2 4.274 7.5.825 12 5.501l2 1.998a.75.75 0 0 0 1.06-1.06l-1.93-1.933C17.369 1.403 22 4.675 22 9.137c0 4.405-3.298 6.946-6.106 9.11q-.44.337-.856.664C14 19.729 13 20.5 12 20.5s-2-.77-3.038-1.59q-.417-.326-.856-.663" />
                        </svg>
                        <span>{post.likes || 0}</span>
                      </div>

                      {/* Comment Button */}
                      <button
                        className="flex items-center space-x-1 bg-gray-700 rounded-lg p-2 mr-2"
                        onClick={() => {
                          window.location.href = `/posts/${post.id}`;
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24" className="fill-gray-400">
                          <path d="m13.629 20.472l-.542.916c-.483.816-1.69.816-2.174 0l-.542-.916c-.42-.71-.63-1.066-.968-1.262c-.338-.197-.763-.204-1.613-.219c-1.256-.021-2.043-.098-2.703-.372a5 5 0 0 1-2.706-2.706C2 14.995 2 13.83 2 11.5v-1c0-3.273 0-4.91.737-6.112a5 5 0 0 1 1.65-1.651C5.59 2 7.228 2 10.5 2h3c3.273 0 4.91 0 6.113.737a5 5 0 0 1 1.65 1.65C22 5.59 22 7.228 22 10.5v1c0 2.33 0 3.495-.38 4.413a5 5 0 0 1-2.707 2.706c-.66.274-1.447.35-2.703.372c-.85.015-1.275.022-1.613.219c-.338.196-.548.551-.968 1.262" opacity={0.5} />
                          <path d="M17 11a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-4 0a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-4 0a1 1 0 1 1-2 0a1 1 0 0 1 2 0" />
                        </svg>
                        <span>Comment</span>
                      </button>
                    </div>

                    {/* Share Button */}
                    <button
                      className="flex items-center bg-gray-700 rounded-full p-2"
                      onClick={() => handleShare(post)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" className="fill-gray-400">
                        <path d="M3.464 3.464C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12s0-7.071 1.464-8.536" opacity={0.5} />
                        <path fillRule="evenodd" d="M16.47 1.47a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06l3.72-3.72H14c-1.552 0-2.467.757-2.788 1.08l-.19.191l-.193.191c-.322.32-1.079 1.236-1.079 2.788v3a.75.75 0 0 1-1.5 0v-3c0-2.084 1.027-3.36 1.521-3.851l.19-.189l.188-.189C10.64 7.277 11.916 6.25 14 6.25h6.19l-3.72-3.72a.75.75 0 0 1 0-1.06" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div >
  );
}
