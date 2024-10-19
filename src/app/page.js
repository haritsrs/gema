"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faRetweet, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { faComment as farComment } from '@fortawesome/free-regular-svg-icons';
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
  
  //Share Post Methods
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
        <div className="flex-col p-4 w-full min-h-screen text-white">
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
      <div className="flex items-center justify-evenly text-gray-500 mt-2">
        <div className="flex items-center space-x-1">
          <FontAwesomeIcon icon={farComment} />
          <span>Comment</span>
        </div>
        <div
          className={`flex items-center space-x-1 cursor-pointer ${
            post.likedBy?.includes(currentUser?.uid) ? 'text-purple-500' : ''
          }`}
          onClick={() => handleLike(post.id, post.likes, post.likedBy || [])}
        >
          <FontAwesomeIcon icon={faHeart} />
          <span>{post.likes || 0}</span>
        </div>
        <div className="flex items-center space-x-1" onClick={() => sharePost(post)}>
          <FontAwesomeIcon icon={faRetweet} />
          <span>Share</span>
        </div>
      </div>
    </li>
  ))}
</ul>
              <div ref={observerRef} className="h-10"></div> {/* This div triggers infinite scroll */}
              {loading && <p>Loading more posts...</p>}
              {noMorePosts && <p>No more posts to load.</p>}
            </div>
          </div>
        </div>
      </div>
  );
}
