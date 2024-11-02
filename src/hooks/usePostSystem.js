// hooks/usePostSystem.js
"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { getDatabase, ref, get, query, orderByChild, limitToLast, endBefore, update, onValue } from 'firebase/database';

const POSTS_PER_PAGE = 30;
const TIME_WEIGHT = 1;
const LIKE_WEIGHT = 2;
const CACHE_EXPIRY = 5 * 60 * 1000;

// Utility functions
const createPostsCache = () => {
  const cache = new Map();
  const lastCleanup = Date.now();

  return {
    get: (key) => cache.get(key),
    set: (key, value) => {
      // Clean up old entries if needed
      if (Date.now() - lastCleanup > CACHE_EXPIRY) {
        for (const [k, v] of cache.entries()) {
          if (Date.now() - v.timestamp > CACHE_EXPIRY) {
            cache.delete(k);
          }
        }
      }
      cache.set(key, { value, timestamp: Date.now() });
    },
    clear: () => cache.clear()
  };
};

export function usePostSystem() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [lastVisibleTimestamp, setLastVisibleTimestamp] = useState(null);
  const [noMorePosts, setNoMorePosts] = useState(false);
  
  const postsCache = useRef(createPostsCache());
  const postsRef = useRef(null);
  const database = getDatabase();

  // Memoized relevancy score calculator
  const calculateRelevancyScore = useCallback((post) => {
    const cacheKey = `relevancy-${post.id}-${post.likes}-${post.createdAt}`;
    const cachedScore = postsCache.current.get(cacheKey);
    
    if (cachedScore && Date.now() - cachedScore.timestamp < CACHE_EXPIRY) {
      return cachedScore.value;
    }

    const now = Date.now();
    const postAge = (now - post.createdAt) / (1000 * 60 * 60);
    const likes = post.likes || 0;
    
    const score = (1 / Math.pow(postAge + 2, TIME_WEIGHT)) * Math.pow(likes + 1, LIKE_WEIGHT);
    postsCache.current.set(cacheKey, score);
    
    return score;
  }, []);

  // Optimized sort function with memoization
  const sortPostsByRelevancy = useCallback((postsToSort) => {
    return [...postsToSort].sort((a, b) => {
      const scoreA = calculateRelevancyScore(a);
      const scoreB = calculateRelevancyScore(b);
      return scoreB - scoreA;
    });
  }, [calculateRelevancyScore]);

  // Batch update handler for better performance
  const batchUpdatePosts = useCallback((newPosts) => {
    setPosts(prevPosts => {
      const postsMap = new Map(prevPosts.map(post => [post.id, post]));
      
      // Update existing posts and add new ones
      newPosts.forEach(post => {
        postsMap.set(post.id, post);
      });
      
      const updatedPosts = Array.from(postsMap.values());
      return sortPostsByRelevancy(updatedPosts);
    });
  }, [sortPostsByRelevancy]);

  // Optimized real-time posts listener
  useEffect(() => {
    if (!postsRef.current) {
      postsRef.current = ref(database, 'posts');
    }

    const recentPostsQuery = query(
      postsRef.current,
      orderByChild('createdAt'),
      limitToLast(POSTS_PER_PAGE)
    );

    const handleNewPosts = (snapshot) => {
      if (!snapshot.exists()) {
        setInitialLoading(false);
        return;
      }

      const postsData = [];
      snapshot.forEach((childSnapshot) => {
        postsData.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });

      batchUpdatePosts(postsData);
      
      const oldestPost = postsData[0];
      if (oldestPost) {
        setLastVisibleTimestamp(oldestPost.createdAt);
      }

      setInitialLoading(false);
    };

    const unsubscribe = onValue(recentPostsQuery, handleNewPosts, {
      onlyOnce: false
    });
    
    return () => {
      unsubscribe();
      postsCache.current.clear();
    };
  }, [database, batchUpdatePosts]);

  // Optimized fetch older posts with debouncing
  const fetchOlderPosts = useCallback(async () => {
    if (loading || noMorePosts || !lastVisibleTimestamp) return;
    
    setLoading(true);
    try {
      const olderPostsQuery = query(
        postsRef.current,
        orderByChild('createdAt'),
        endBefore(lastVisibleTimestamp),
        limitToLast(POSTS_PER_PAGE)
      );
      
      const snapshot = await get(olderPostsQuery);
      
      if (!snapshot.exists()) {
        setNoMorePosts(true);
        return;
      }

      const olderPosts = [];
      snapshot.forEach((childSnapshot) => {
        olderPosts.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });

      if (olderPosts.length === 0) {
        setNoMorePosts(true);
        return;
      }

      batchUpdatePosts(olderPosts);
      
      // Update last visible timestamp
      const oldestPost = olderPosts[0];
      if (oldestPost) {
        setLastVisibleTimestamp(oldestPost.createdAt);
      }

      if (olderPosts.length < POSTS_PER_PAGE) {
        setNoMorePosts(true);
      }

    } catch (error) {
      console.error("Error fetching older posts:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, noMorePosts, lastVisibleTimestamp, batchUpdatePosts]);

  // Optimized like handler with optimistic updates
  const handleLike = useCallback(async (postId, currentLikes, likedBy = [], userId) => {
    if (!userId) return;

    const postRef = ref(database, `posts/${postId}`);
    const hasLiked = likedBy.includes(userId);
    const newLikes = hasLiked ? currentLikes - 1 : currentLikes + 1;
    const newLikedBy = hasLiked
      ? likedBy.filter(uid => uid !== userId)
      : [...likedBy, userId];

    // Optimistic update
    setPosts(prevPosts => {
      const updatedPosts = prevPosts.map(post =>
        post.id === postId
          ? { ...post, likes: newLikes, likedBy: newLikedBy }
          : post
      );
      return sortPostsByRelevancy(updatedPosts);
    });

    try {
      await update(postRef, {
        likes: newLikes,
        likedBy: newLikedBy
      });
    } catch (error) {
      console.error("Error updating likes:", error);
      // Revert optimistic update
      setPosts(prevPosts => {
        const revertedPosts = prevPosts.map(post =>
          post.id === postId
            ? { ...post, likes: currentLikes, likedBy }
            : post
        );
        return sortPostsByRelevancy(revertedPosts);
      });
    }
  }, [database, sortPostsByRelevancy]);

  return {
    posts,
    loading,
    initialLoading,
    noMorePosts,
    fetchOlderPosts,
    handleLike
  };
}