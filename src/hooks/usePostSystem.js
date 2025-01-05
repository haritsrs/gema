"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { getDatabase, ref, get, query, orderByChild, limitToLast, endBefore, update, onValue } from 'firebase/database';
import { useNotifications } from './useNotifications';

const POSTS_PER_PAGE = 30;
const TIME_WEIGHT = 1;
const LIKE_WEIGHT = 2;
const CACHE_EXPIRY = 5 * 60 * 1000;
const SORT_DELAY = 5000;

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
  const {addNotification} = useNotifications();
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

  const handlePostDeleted = (deletedPostId) => {
    // Update the local state by filtering out the deleted post
    setPosts((currentPosts) =>
      currentPosts.filter(post => post.id !== deletedPostId)
    );

  };

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

    const cache = postsCache.current;

    return () => {
      unsubscribe();
      postsCache.current.clear();
      if (sortTimeoutRef.current) {
        clearTimeout(sortTimeoutRef.current);
      }
    };
  }, [database, batchUpdatePosts]);

  // Modified handleLike that doesn't trigger immediate sort
  const handleLike = useCallback(async (post, currentLikes, likedBy = [], currentUser) => {
    if (!currentUser) return;

    const postRef = ref(database, `posts/${post.id}`);
    const hasLiked = likedBy.includes(currentUser.uid);
    const newLikes = hasLiked ? currentLikes - 1 : currentLikes + 1;
    const newLikedBy = hasLiked
      ? likedBy.filter(uid => uid !== currentUser.uid)
      : [...likedBy, currentUser.uid];

    // Update without sorting
    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === post.id
          ? { ...p, likes: newLikes, likedBy: newLikedBy }
          : p
      )
    );

    try {
      await update(postRef, {
        likes: newLikes,
        likedBy: newLikedBy
      });

      if (!hasLiked) {
        const postAuthorId = post.userId;
        const notification = {
          type: 'like',
          triggeredBy: {
            uid: currentUser.uid,
          },
          postId: post.id,
          timestamp: Date.now(),
          message: `${currentUser.displayName || 'Someone'} liked your post`,
        };
        addNotification(postAuthorId, notification);
      }
    } catch (error) {
      console.error("Error updating likes:", error);
      // Revert update without sorting
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === post.id
            ? { ...p, likes: currentLikes, likedBy }
            : p
        )
      );
    }
  }, [database, addNotification]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown";
  
    const now = Date.now();
    const postDate = new Date(timestamp);
    const secondsAgo = Math.floor((now - postDate) / 1000);
  
    if (secondsAgo < 30) return "Just now";
    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
    if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)}d ago`;
  
    // Format the date based on the time difference
    const options = {
      month: "short",
      day: "2-digit",
      ...(secondsAgo >= 31536000 && { year: "numeric" }), // Add year if it's over a year ago
    };
  
    return postDate.toLocaleDateString("en-US", options);
  };
  


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
    handlePostDeleted,
    formatTimestamp
  };
}
