"use client";

import { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, get, query, orderByChild, limitToLast, startAt, update, onValue, off } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase.js';
import localFont from "next/font/local";
import Posting from '../components/posting';
import Link from 'next/link';

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
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [lastVisibleTimestamp, setLastVisibleTimestamp] = useState(null);
  const [noMorePosts, setNoMorePosts] = useState(false);
  const observerRef = useRef();
  const postsRef = useRef(ref(getDatabase(), 'posts'));
  const database = getDatabase();
  const storage = getStorage();

  // Memoized relevancy score calculator
  const calculateRelevancyScore = (post) => {
    const now = Date.now();
    const postAge = (now - post.createdAt) / (1000 * 60 * 60);
    const likes = post.likes || 0;
    const timeWeight = 1;
    const likeWeight = 2;
    return (1 / Math.pow(postAge + 2, timeWeight)) * Math.pow(likes + 1, likeWeight);
  };

  // Optimized sort function with memoization
  const sortPostsByRelevancy = (postsToSort) => {
    return [...postsToSort].sort((a, b) => {
      const scoreA = calculateRelevancyScore(a);
      const scoreB = calculateRelevancyScore(b);
      return scoreB - scoreA;
    });
  };

  // Authentication listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Real-time posts listener with deduplication
  useEffect(() => {
    const recentPostsQuery = query(
      postsRef.current,
      orderByChild('createdAt'),
      limitToLast(20)
    );

    const handleNewPosts = (snapshot) => {
      if (!snapshot.exists()) return;

      const postsData = [];
      snapshot.forEach((childSnapshot) => {
        postsData.unshift({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });

      // Deduplicate posts
      setPosts(prevPosts => {
        const uniquePosts = postsData.filter(
          newPost => !prevPosts.some(existingPost => existingPost.id === newPost.id)
        );
        
        if (uniquePosts.length === 0) return prevPosts;
        
        const mergedPosts = [...prevPosts];
        uniquePosts.forEach(newPost => {
          const existingIndex = mergedPosts.findIndex(p => p.id === newPost.id);
          if (existingIndex !== -1) {
            mergedPosts[existingIndex] = newPost;
          } else {
            mergedPosts.unshift(newPost);
          }
        });

        return sortPostsByRelevancy(mergedPosts);
      });

      setInitialLoading(false);
      
      const lastPost = postsData[postsData.length - 1];
      if (lastPost) {
        setLastVisibleTimestamp(lastPost.createdAt);
      }
    };

    const unsubscribe = onValue(recentPostsQuery, handleNewPosts);
    return () => unsubscribe();
  }, []);

  // Optimized fetch older posts function
  const fetchOlderPosts = async () => {
    if (loading || noMorePosts || !lastVisibleTimestamp) return;

    setLoading(true);
    try {
      const olderPostsQuery = query(
        postsRef.current,
        orderByChild('createdAt'),
        startAt(lastVisibleTimestamp),
        limitToLast(7)
      );

      const snapshot = await get(olderPostsQuery);
      if (!snapshot.exists()) {
        setNoMorePosts(true);
        return;
      }

      const olderPosts = [];
      snapshot.forEach((childSnapshot) => {
        olderPosts.unshift({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });

      setPosts(prevPosts => {
        const uniqueOlderPosts = olderPosts.filter(
          newPost => !prevPosts.some(existingPost => existingPost.id === newPost.id)
        );
        
        if (uniqueOlderPosts.length === 0) {
          setNoMorePosts(true);
          return prevPosts;
        }

        const lastPost = uniqueOlderPosts[uniqueOlderPosts.length - 1];
        if (lastPost) {
          setLastVisibleTimestamp(lastPost.createdAt);
        }

        return [...prevPosts, ...uniqueOlderPosts];
      });
    } catch (error) {
      console.error("Error fetching older posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Optimized like handler with real-time updates
  const handleLike = async (postId, currentLikes, likedBy = []) => {
    if (!currentUser) return;

    const postRef = ref(database, `posts/${postId}`);
    const hasLiked = likedBy.includes(currentUser.uid);

    try {
      const updates = {
        likes: hasLiked ? (currentLikes - 1) : (currentLikes + 1),
        likedBy: hasLiked
          ? likedBy.filter(uid => uid !== currentUser.uid)
          : [...likedBy, currentUser.uid]
      };

      // Optimistic update
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId
            ? { ...post, likes: updates.likes, likedBy: updates.likedBy }
            : post
        )
      );

      await update(postRef, updates);
    } catch (error) {
      console.error("Error updating likes:", error);
      // Revert optimistic update on error
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId
            ? { ...post, likes: currentLikes, likedBy }
            : post
        )
      );
    }
  };

  // Optimized share functionality
  const sharePost = (post) => {
    if (navigator.share) {
      navigator.share({
        title: post.title || "Check out this post!",
        text: post.content || "Take a look at this post on our platform!",
        url: `${window.location.origin}/posts/${postId}`,
      })
      .then(() => console.log('Post shared successfully'))
      .catch((error) => console.error('Error sharing the post:', error));
    } else {
      copyToClipboard(postId);
    }
  };

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry.isIntersecting && !loading && !noMorePosts) {
          fetchOlderPosts();
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.5,
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loading, noMorePosts]);

  // Timestamp formatter with memoization
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
      <div className="max-w-2xl mx-auto px-4">
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Posts</h2>
          </div>

          <Posting onPostCreated={() => {}} storage={storage} />

          {initialLoading ? (
            <div className="text-white text-center py-4">Loading initial posts...</div>
          ) : (
            <ul className="space-y-4">
              {posts.map((post) => (
                <li key={post.id} className="text-white p-4 bg-gray-800 rounded-lg">
                  <Link href={`/posts/${post.id}`}>
                    <div className="flex space-x-2 cursor-pointer">
                      <img
                        src={post.profilePicture || 'https://placehold.co/40x40'}
                        alt={`${post.username || 'User'}'s profile`}
                        className="rounded-full w-10 h-10"
                      />
                      <div className="flex-1">
                        <div className="font-bold">
                          {post.username || 'User'}{' '}
                          <span className="text-gray-500">· {formatTimestamp(post.createdAt)}</span>
                        </div>
                        <div>{post.content}</div>
                        {post.imageUrl && (
                          <img
                            src={post.imageUrl}
                            alt="Post image"
                            className="mt-2 w-full h-auto rounded-lg"
                          />
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center justify-between text-gray-300 mt-2">
                    <div className="flex mx-2">
                      <button
                        className={`flex items-center space-x-1 cursor-pointer rounded-lg drop-shadow-md active:filter-none p-2 mr-2 justify-center ${
                          post.likedBy?.includes(currentUser?.uid)
                            ? 'text-purple-800 bg-purple-300 bg-opacity-50 fill-purple-800'
                            : 'bg-gray-700 fill-gray-500'
                        }`}
                        onClick={() => handleLike(post.id, post.likes || 0, post.likedBy || [])}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24">
                          <path d="M8.106 18.247C5.298 16.083 2 13.542 2 9.137C2 4.274 7.5.825 12 5.501l2 1.998a.75.75 0 0 0 1.06-1.06l-1.93-1.933C17.369 1.403 22 4.675 22 9.137c0 4.405-3.298 6.946-6.106 9.11q-.44.337-.856.664C14 19.729 13 20.5 12 20.5s-2-.77-3.038-1.59q-.417-.326-.856-.663" />
                        </svg>
                        <span>{post.likes || 0}</span>
                      </button>
                      <button className="flex items-center space-x-1 bg-gray-700 fill-gray-400 active:bg-purple-300 active:bg-opacity-50 active:fill-purple-800 active:text-purple-800 rounded-lg drop-shadow-md active:filter-none p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24">
                          <path d="m13.629 20.472l-.542.916c-.483.816-1.69.816-2.174 0l-.542-.916c-.42-.71-.63-1.066-.968-1.262c-.338-.197-.763-.204-1.613-.219c-1.256-.021-2.043-.098-2.703-.372a5 5 0 0 1-2.706-2.706C2 14.995 2 13.83 2 11.5v-1c0-3.273 0-4.91.737-6.112a5 5 0 0 1 1.65-1.651C5.59 2 7.228 2 10.5 2h3c3.273 0 4.91 0 6.113.737a5 5 0 0 1 1.65 1.65C22 5.59 22 7.228 22 10.5v1c0 2.33 0 3.495-.38 4.413a5 5 0 0 1-2.707 2.706c-.66.274-1.447.35-2.703.372c-.85.015-1.275.022-1.613.219c-.338.196-.548.551-.968 1.262" opacity={0.5} />
                          <path d="M17 11a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-4 0a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-4 0a1 1 0 1 1-2 0a1 1 0 0 1 2 0" />
                        </svg>
                        <span>Comment</span>
                      </button>
                    </div>
                    <button
                      className="flex items-center cursor-pointer bg-gray-700 fill-gray-400 active:bg-purple-300 active:bg-opacity-50 active:fill-purple-800 rounded-3xl drop-shadow-lg p-2 mr-2"
                      onClick={() => sharePost(post)}
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
          )}
          
          <div ref={observerRef} className="h-px" />
          {loading && <div className="text-white text-center py-4">Loading more posts...</div>}
          {noMorePosts && <div className="text-white text-center py-4">No more posts to load.</div>}
        </div>
      </div>
    </div>
  );
}