"use client";

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { getStorage } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase.js';
import localFont from "next/font/local";
import Posting from '../components/posting';
import Link from 'next/link';
import LoadingOverlay from '../components/LoadingOverlay';
import { usePostSystem } from '../hooks/usePostSystem';
import PostDropdown from '../components/PostDropdown';

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
  const [currentUser, setCurrentUser] = useState(null);
  const storage = getStorage();
  const loadMoreRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  const {
    posts,
    loading,
    initialLoading,
    noMorePosts,
    fetchOlderPosts,
    handleLike,
    handleDeletePost
  } = usePostSystem();

  // Authentication listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Load more posts when shouldLoad is true
  useEffect(() => {
    if (shouldLoad && !loading && !noMorePosts) {
      fetchOlderPosts();
      setShouldLoad(false);
    }
  }, [shouldLoad, loading, noMorePosts, fetchOlderPosts]);

  // Set up intersection observer using useLayoutEffect
  useLayoutEffect(() => {
    let observer = null;

    const handleIntersect = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !loading && !noMorePosts) {
        setShouldLoad(true);
      }
    };

    const setupObserver = () => {
      if (loadMoreRef.current) {
        observer = new IntersectionObserver(handleIntersect, {
          root: null,
          rootMargin: '100px',
          threshold: 0
        });

        observer.observe(loadMoreRef.current);
      }
    };

    // Initial setup
    setupObserver();

    // Cleanup
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [loading, noMorePosts]); // Dependencies that affect observation

  // Share function
  const handleShare = async (post) => {
    const postUrl = `${window.location.origin}/posts/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title || "Check out this post!",
          text: post.content || "Take a look at this post on our platform!",
          url: postUrl,
        });
      } else {
        await navigator.clipboard.writeText(postUrl);
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown";
    const now = Date.now();
    const postDate = new Date(timestamp);
    const secondsAgo = Math.floor((now - postDate) / 1000);

    if (secondsAgo < 30) return "Just now";
    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
    return `${Math.floor(secondsAgo / 86400)}d ago`;
  };

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen w-full bg-gray-900`}>
      <LoadingOverlay isLoading={initialLoading} />

      <div className="max-w-2xl mx-auto px-4">
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Posts</h2>
          </div>

          <Posting onPostCreated={() => { }} storage={storage} />

          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post.id} className="text-white p-4 bg-gray-800 rounded-lg">
                <div className="flex space-x-2">
                  <img
                    src={post.profilePicture || '/default-avatar.png'}
                    alt={`${post.username || 'User'}'s profile`}
                    className="rounded-full w-10 h-10 object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="font-bold">
                        {post.username || 'User'}{' '}
                        <span className="text-gray-500">· {formatTimestamp(post.createdAt)}</span>
                      </div>
                      <PostDropdown
                        post={post}
                        currentUser={currentUser}
                        onDelete={handleDeletePost}
                      />
                    </div>
                    
                    <Link href={`/posts/${post.id}`} className="block">
                      <div className="cursor-pointer">
                        <div>{post.content}</div>
                        {post.imageUrl && (
                          <img
                            src={post.imageUrl}
                            alt="Post image"
                            className="mt-2 w-full h-auto rounded-lg"
                            loading="lazy"
                          />
                        )}
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="flex items-center justify-between text-gray-300 mt-2">
                  <div className="flex mx-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleLike(post.id, post.likes || 0, post.likedBy || [], currentUser?.uid);
                      }}
                      className={`flex items-center space-x-1 cursor-pointer rounded-lg drop-shadow-md active:filter-none p-2 mr-2 justify-center ${
                        post.likedBy?.includes(currentUser?.uid)
                          ? 'text-purple-800 bg-purple-300 bg-opacity-50 fill-purple-800'
                          : 'bg-gray-700 fill-gray-500'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24">
                        <path d="M8.106 18.247C5.298 16.083 2 13.542 2 9.137C2 4.274 7.5.825 12 5.501l2 1.998a.75.75 0 0 0 1.06-1.06l-1.93-1.933C17.369 1.403 22 4.675 22 9.137c0 4.405-3.298 6.946-6.106 9.11q-.44.337-.856.664C14 19.729 13 20.5 12 20.5s-2-.77-3.038-1.59q-.417-.326-.856-.663" />
                      </svg>
                      <span>{post.likes || 0}</span>
                    </button>

                    <Link href={`/posts/${post.id}`}>
                      <button
                        className="flex items-center space-x-1 bg-gray-700 fill-gray-400 active:bg-purple-300 active:bg-opacity-50 active:fill-purple-800 active:text-purple-800 rounded-lg drop-shadow-md active:filter-none p-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24">
                          <path d="m13.629 20.472l-.542.916c-.483.816-1.69.816-2.174 0l-.542-.916c-.42-.71-.63-1.066-.968-1.262c-.338-.197-.763-.204-1.613-.219c-1.256-.021-2.043-.098-2.703-.372a5 5 0 0 1-2.706-2.706C2 14.995 2 13.83 2 11.5v-1c0-3.273 0-4.91.737-6.112a5 5 0 0 1 1.65-1.651C5.59 2 7.228 2 10.5 2h3c3.273 0 4.91 0 6.113.737a5 5 0 0 1 1.65 1.65C22 5.59 22 7.228 22 10.5v1c0 2.33 0 3.495-.38 4.413a5 5 0 0 1-2.707 2.706c-.66.274-1.447.35-2.703.372c-.85.015-1.275.022-1.613.219c-.338.196-.548.551-.968 1.262" opacity={0.5} />
                          <path d="M17 11a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-4 0a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-4 0a1 1 0 1 1-2 0a1 1 0 0 1 2 0" />
                        </svg>
                        <span>Comment</span>
                      </button>
                    </Link>
                  </div>

                  <button
                    className="flex items-center cursor-pointer bg-gray-700 fill-gray-400 active:bg-purple-300 active:bg-opacity-50 active:fill-purple-800 rounded-3xl drop-shadow-lg p-2 mr-2"
                    onClick={(e) => {
                      e.preventDefault();
                      handleShare(post);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24">
                      <path d="M3.464 3.464C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12s0-7.071 1.464-8.536" opacity={0.5} />
                      <path fillRule="evenodd" d="M16.47 1.47a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06l3.72-3.72H14c-1.552 0-2.467.757-2.788 1.08l-.19.191l-.193.191c-.322.32-1.079 1.236-1.079 2.788v3a.75.75 0 0 1-1.5 0v-3c0-2.084 1.027-3.36 1.521-3.851l.19-.189l.188-.189C10.64 7.277 11.916 6.25 14 6.25h6.19l-3.72-3.72a.75.75 0 0 1 0-1.06" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Keep the load more section the same */}
          <div className="mt-8 flex flex-col items-center space-y-4">
            <div ref={loadMoreRef} className="h-px" />
            {!noMorePosts && (
              <button
                onClick={fetchOlderPosts}
                disabled={loading}
                className={`w-full max-w-md py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
                  loading
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-white">Loading more posts...</span>
                  </div>
                ) : (
                  'Load More Posts'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
