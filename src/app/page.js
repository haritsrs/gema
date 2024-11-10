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
import { HeartIcon, CommentIcon, ShareIcon, Loading } from '@/icons';

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
    handleDeletePost,
    handlePostDeleted
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
                        onPostDeleted={handlePostDeleted}
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
                      className={`flex items-center space-x-1 cursor-pointer rounded-lg drop-shadow-md active:filter-none p-2 mr-2 justify-center ${post.likedBy?.includes(currentUser?.uid)
                        ? 'text-purple-800 bg-purple-300 bg-opacity-50 fill-purple-800'
                        : 'bg-gray-700 fill-gray-500'
                        }`}
                    >
                      <HeartIcon className="w-5 h-5" />
                      <span>{post.likes || 0}</span>
                    </button>

                    <Link href={`/posts/${post.id}`}>
                      <button
                        className="flex items-center space-x-1 bg-gray-700 fill-gray-400 active:bg-purple-300 active:bg-opacity-50 active:fill-purple-800 active:text-purple-800 rounded-lg drop-shadow-md active:filter-none p-2"
                      >
                        <CommentIcon className="h-5 w-5" />
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
                    <ShareIcon className="h-5 w-5" />
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
                className={`w-full max-w-md py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${loading
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-gray-700 active:bg-purple-800'
                  }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loading />
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
