// page.jsx
"use client";

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { getStorage } from 'firebase/storage';
import { useAuth } from '../hooks/useAuth';
import localFont from "next/font/local";
import { usePostSystem } from '../hooks/usePostSystem';
import { useImageDimensions } from '../hooks/useImageDimensions';
import { useSharePost } from '../hooks/useSharePost';
import PostsView from '../views/homeView.jsx';

const inter = localFont({
  src: "./fonts/Inter-VariableFont_opsz,wght.ttf",
  variable: "--font-inter",
  weight: "100 900",
});

export default function Page() {
  const storage = getStorage();
  const loadMoreRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const { imageDimensions, handleImageLoad } = useImageDimensions();
  const handleShare = useSharePost();
  const { user: currentUser } = useAuth();

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