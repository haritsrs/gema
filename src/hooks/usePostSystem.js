"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { getDatabase, ref, get, query, orderByChild, limitToLast, endBefore, update, onValue, remove } from 'firebase/database';

const POSTS_PER_PAGE = 30;
const TIME_WEIGHT = 1;
const LIKE_WEIGHT = 2;
const CACHE_EXPIRY = 5 * 60 * 1000;
const SORT_DELAY = 500;

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
  const [shouldSort, setShouldSort] = useState(false);

  const postsCache = useRef(createPostsCache());
  const postsRef = useRef(null);
  const sortTimeoutRef = useRef(null);
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

  // Effect to handle delayed sorting
  useEffect(() => {
    if (shouldSort) {
      if (sortTimeoutRef.current) {
        clearTimeout(sortTimeoutRef.current);
      }

      sortTimeoutRef.current = setTimeout(() => {
        setPosts(prevPosts => sortPostsByRelevancy(prevPosts));
        setShouldSort(false);
      }, SORT_DELAY);

      return () => {
        if (sortTimeoutRef.current) {
          clearTimeout(sortTimeoutRef.current);
        }
      };
    }
  }, [shouldSort, sortPostsByRelevancy]);

  // Add handleDeletePost function
  const handleDeletePost = useCallback(async (postId) => {
    if (!postId) return;
  
    try {
      const postRef = ref(database, `posts/${postId}`);
      
      // Optimistically update UI
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  
      // Delete from Firebase
      await remove(postRef);
      
      // Just clear the entire cache since we don't have a method to iterate keys
      postsCache.current.clear();
  
    } catch (error) {
      console.error("Error deleting post:", error);
      
      // Revert the optimistic update if delete fails
      try {
        const postRef = ref(database, `posts/${postId}`);
        const snapshot = await get(postRef);
        if (snapshot.exists()) {
          const post = { id: snapshot.key, ...snapshot.val() };
          setPosts(prevPosts => {
            const updatedPosts = [...prevPosts, post];
            return sortPostsByRelevancy(updatedPosts);
          });
        }
      } catch (rollbackError) {
        console.error("Error rolling back delete:", rollbackError);
      }
    }
  }, [database, sortPostsByRelevancy]);

  // Modified batch update handler that always sorts
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

  // Optimized fetch older posts with immediate sorting
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
      if (sortTimeoutRef.current) {
        clearTimeout(sortTimeoutRef.current);
      }
    };
  }, [database, batchUpdatePosts]);

  // Modified handleLike that doesn't trigger immediate sort
  const handleLike = useCallback(async (postId, currentLikes, likedBy = [], userId) => {
    if (!userId) return;

    const postRef = ref(database, `posts/${postId}`);
    const hasLiked = likedBy.includes(userId);
    const newLikes = hasLiked ? currentLikes - 1 : currentLikes + 1;
    const newLikedBy = hasLiked
      ? likedBy.filter(uid => uid !== userId)
      : [...likedBy, userId];

    // Update without sorting
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, likes: newLikes, likedBy: newLikedBy }
          : post
      )
    );

    try {
      await update(postRef, {
        likes: newLikes,
        likedBy: newLikedBy
      });
    } catch (error) {
      console.error("Error updating likes:", error);
      // Revert update without sorting
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, likes: currentLikes, likedBy }
            : post
        )
      );
    }
  }, [database]);

  // Function to manually trigger sorting
  const triggerSort = useCallback(() => {
    setShouldSort(true);
  }, []);

  return {
    posts,
    loading,
    initialLoading,
    noMorePosts,
    fetchOlderPosts,
    handleLike,
    triggerSort,
    handleDeletePost
  };
}
