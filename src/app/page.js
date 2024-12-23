// page.jsx
"use client";

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { getStorage } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase.js';
import localFont from "next/font/local";
import { usePostSystem } from '../hooks/usePostSystem';
import { useImageDimensions } from '../hooks/useImageDimensions';
import { useSharePost } from '../hooks/useSharePost';
import PostsView from './PostsView';

const inter = localFont({
  src: "./fonts/Inter-VariableFont_opsz,wght.ttf",
  variable: "--font-inter",
  weight: "100 900",
});

export default function Page() {
  const [currentUser, setCurrentUser] = useState(null);
  const storage = getStorage();
  const loadMoreRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const { imageDimensions, handleImageLoad } = useImageDimensions();
  const handleShare = useSharePost();

  const {
    posts,
    loading,
    initialLoading,
    noMorePosts,
    fetchOlderPosts,
    handleLike,
    handleDeletePost,
    handlePostDeleted,
    formatTimestamp
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
  }, [loading, noMorePosts]);

  return (
    <PostsView
      inter={inter}
      posts={posts}
      currentUser={currentUser}
      storage={storage}
      initialLoading={initialLoading}
      loading={loading}
      noMorePosts={noMorePosts}
      loadMoreRef={loadMoreRef}
      imageDimensions={imageDimensions}
      handleImageLoad={handleImageLoad}
      handleLike={handleLike}
      handleDeletePost={handleDeletePost}
      handlePostDeleted={handlePostDeleted}
      handleShare={handleShare}
      formatTimestamp={formatTimestamp}
      fetchOlderPosts={fetchOlderPosts}
    />
  );
}