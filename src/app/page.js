"use client";

import { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase.js';
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, orderBy, limit, startAfter, query } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase.js';
import localFont from "next/font/local";
import Posting from '../components/posting';
import Link from 'next/link';

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
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastVisiblePost, setLastVisiblePost] = useState(null); // Track pagination
  const [noMorePosts, setNoMorePosts] = useState(false); // Track if there are no more posts to fetch
  const observerRef = useRef(); // Ref for the infinite scroll trigger

  // Set up Firebase auth listener to get current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch relevant posts from Firestore with pagination
  const fetchPosts = async (lastPost = null) => {
    if (loading || noMorePosts) return; // Prevent multiple fetches while already loading or if no more posts

    setLoading(true);
    try {
      const q = lastPost
        ? query(
            collection(db, 'posts'),
            orderBy('likes', 'desc'),
            orderBy('createdAt', 'desc'),
            startAfter(lastPost),
            limit(7) // Fetch 7 posts at a time
          )
        : query(collection(db, 'posts'), orderBy('likes', 'desc'), orderBy('createdAt', 'desc'), limit(7)); // Limit 7 posts initially

      const querySnapshot = await getDocs(q);
      
      // If no posts are returned, stop further fetching
      if (querySnapshot.empty) {
        setNoMorePosts(true);
        setLoading(false);
        return;
      }

      const postsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Filter out any duplicate posts that already exist in state
      setPosts((prevPosts) => {
        const postIds = prevPosts.map((post) => post.id);
        const newPosts = postsData.filter((post) => !postIds.includes(post.id));
        return [...prevPosts, ...newPosts]; // Append only non-duplicate posts
      });

      // Set the last visible post for pagination
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisiblePost(lastVisible);
    } catch (error) {
      console.error("Error fetching posts: ", error);
    } finally {
      setLoading(false); // Ensure loading is reset
    }
  };

  // Handle Like functionality
  const handleLike = async (postId, currentLikes, likedBy = []) => {
    if (!currentUser) return; // Ensure user is logged in
  
    const postRef = doc(db, 'posts', postId);
    const hasLiked = likedBy.includes(currentUser.uid);
  
    try {
      if (hasLiked) {
        // If already liked, remove the like
        await updateDoc(postRef, {
          likes: currentLikes - 1,
          likedBy: arrayRemove(currentUser.uid), // Remove user from likedBy
        });
      } else {
        // If not liked, add a like
        await updateDoc(postRef, {
          likes: currentLikes + 1,
          likedBy: arrayUnion(currentUser.uid), // Add user to likedBy
        });
      }
  
      // Update the post in the state without refetching all posts
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: hasLiked ? currentLikes - 1 : currentLikes + 1,
                likedBy: hasLiked
                  ? (post.likedBy || []).filter((uid) => uid !== currentUser.uid) // Remove user from likedBy, ensuring likedBy is an array
                  : [...(post.likedBy || []), currentUser.uid], // Add user to likedBy, ensuring likedBy is an array
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error updating likes: ", error);
    }
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
  
  // Share Post Methods
  const sharePost = (post) => {
    if (navigator.share) {
      navigator.share({
        title: post.title || "Check out this post!",
        text: post.content,
        url: `${window.location.origin}/posts/${post.id}`,
      })
      .then(() => console.log('Post shared successfully'))
      .catch((error) => console.error('Error sharing the post:', error));
    } else {
      copyToClipboard(post);
    }
  };
  
  // If Web Share API not supported
  const copyToClipboard = (post) => {
    const postUrl = `${window.location.origin}/posts/${post.id}`;
    
    navigator.clipboard.writeText(postUrl)
      .then(() => {
        alert('Post URL copied to clipboard!');
      })
      .catch(() => {
        alert('Failed to copy URL.');
      });
  };

  // Infinite scroll logic
  const handleObserver = (entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && !loading && lastVisiblePost && !noMorePosts) {
      fetchPosts(lastVisiblePost); // Fetch next set of posts when scroll reaches the end
    }
  };

  useEffect(() => {
    fetchPosts(); // Initial fetch
  }, []);

  useEffect(() => {
    if (observerRef.current) {
      const observer = new IntersectionObserver(handleObserver, {
        root: null,
        rootMargin: '200px', // Adjust root margin to trigger earlier, preventing flickering
        threshold: 0.5, // Trigger only when 50% of the observerRef is visible
      });
      observer.observe(observerRef.current);
      return () => observer.disconnect();
    }
  }, [lastVisiblePost, loading, noMorePosts]);

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <div className="flex grow items-center justify-center">
        <div className="flex-col p-4 w-full max-w-xl min-h-screen text-white">
          <div className="space-y-4">
            <Posting onPostCreated={fetchPosts} />

            <h2 className="text-xl font-bold mb-2">Posts</h2>
            <ul>
              {posts.map((post) => (
                <li key={post.id} className="mb-4 text-white p-4 bg-gray-800 rounded-lg">
                  <Link href={`/posts/${post.id}`}>
                    <div className="flex space-x-2 cursor-pointer">
                      <img
                        src={post.profilePicture || 'https://placehold.co/40x40'}
                        alt={`${post.username || 'User'}'s profile`}
                        className="rounded-full"
                        style={{ width: '40px', height: '40px' }}
                      />
                      <div>
                        <div className="font-bold">
                          {post.username || 'User'}{' '}
                          <span className="text-gray-500">· {formatTimestamp(post.createdAt)}</span>
                        </div>
                        <div>{post.content}</div>
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center justify-between text-gray-300 mt-2">
                    <div className="flex mx-2">
                      <button
                      className={`flex items-center space-x-1 cursor-pointer rounded-lg drop-shadow-md active:filter-none p-2 mr-2 justify-center ${
                        post.likedBy?.includes(currentUser?.uid) ? 'text-purple-800 bg-purple-300 bg-opacity-50 fill-purple-800' : 'bg-gray-700 fill-gray-500'}`}
                      onClick={() => handleLike(post.id, post.likes, post.likedBy)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24">
                          <path d="M8.106 18.247C5.298 16.083 2 13.542 2 9.137C2 4.274 7.5.825 12 5.501l2 1.998a.75.75 0 0 0 1.06-1.06l-1.93-1.933C17.369 1.403 22 4.675 22 9.137c0 4.405-3.298 6.946-6.106 9.11q-.44.337-.856.664C14 19.729 13 20.5 12 20.5s-2-.77-3.038-1.59q-.417-.326-.856-.663">
                          </path>
                        </svg>
                        <span>{post.likes || 0}</span>
                      </button>
                      <button className="flex items-center space-x-1 bg-gray-700 fill-gray-400 active:bg-purple-300 active:bg-opacity-50 active:fill-purple-800 active:text-purple-800 rounded-lg drop-shadow-md active:filter-none p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24">
                          <path d="m13.629 20.472l-.542.916c-.483.816-1.69.816-2.174 0l-.542-.916c-.42-.71-.63-1.066-.968-1.262c-.338-.197-.763-.204-1.613-.219c-1.256-.021-2.043-.098-2.703-.372a5 5 0 0 1-2.706-2.706C2 14.995 2 13.83 2 11.5v-1c0-3.273 0-4.91.737-6.112a5 5 0 0 1 1.65-1.651C5.59 2 7.228 2 10.5 2h3c3.273 0 4.91 0 6.113.737a5 5 0 0 1 1.65 1.65C22 5.59 22 7.228 22 10.5v1c0 2.33 0 3.495-.38 4.413a5 5 0 0 1-2.707 2.706c-.66.274-1.447.35-2.703.372c-.85.015-1.275.022-1.613.219c-.338.196-.548.551-.968 1.262" opacity={0.5}>
                          </path>
                          <path d="M17 11a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-4 0a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-4 0a1 1 0 1 1-2 0a1 1 0 0 1 2 0">
                          </path>
                      </svg>
                      <span>Comment</span>
                      </button>
                    </div>
                    <button
                      className="flex items-center cursor-pointer bg-gray-700 fill-gray-400 active:bg-purple-300 active:bg-opacity-50 active:fill-purple-800 rounded-3xl drop-shadow-lg p-2 mr-2"
                      onClick={() => sharePost(post)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24">
                        <path d="M3.464 3.464C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12s0-7.071 1.464-8.536" opacity={0.5}>
                        </path>
                        <path fillRule="evenodd" d="M16.47 1.47a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06l3.72-3.72H14c-1.552 0-2.467.757-2.788 1.08l-.19.191l-.193.191c-.322.32-1.079 1.236-1.079 2.788v3a.75.75 0 0 1-1.5 0v-3c0-2.084 1.027-3.36 1.521-3.851l.19-.189l.188-.189C10.64 7.277 11.916 6.25 14 6.25h6.19l-3.72-3.72a.75.75 0 0 1 0-1.06" clipRule="evenodd"></path>
                      </svg>
                    </button>
                    {/*<div className="flex items-center space-x-1">
                      <FontAwesomeIcon icon={faChartBar} />
                      <span>Stats</span>
                    </div>*/}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div ref={observerRef} style={{ height: '1px' }}></div>
          {loading && <div>Loading...</div>}
          {noMorePosts && <div>No more posts to load.</div>}
        </div>
      </div>
    </div>
  );
}
