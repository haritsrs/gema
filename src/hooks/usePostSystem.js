import { useState, useEffect, useRef, useCallback } from 'react';
import { getDatabase, ref, get, query, orderByChild, limitToLast, endBefore, startAfter, update, onValue, remove } from 'firebase/database';

const POSTS_PER_PAGE = 20;
const TIME_WEIGHT = 1;
const LIKE_WEIGHT = 2;
const CACHE_EXPIRY = 5 * 60 * 1000;
const SORT_DELAY = 500;
const INITIAL_FETCH_LIMIT = 500;

// Utility function for creating posts cache with automatic cleanup
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
  // State management
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [lastVisibleScore, setLastVisibleScore] = useState(null);
  const [noMorePosts, setNoMorePosts] = useState(false);
  const [shouldSort, setShouldSort] = useState(true);

  // Refs
  const postsCache = useRef(createPostsCache());
  const postsRef = useRef(null);
  const sortTimeoutRef = useRef(null);
  const database = getDatabase();
  const allFetchedPosts = useRef(new Map());

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

  // Optimized sort function
  const sortPostsByRelevancy = useCallback((postsToSort) => {
    const sortedPosts = [...postsToSort].sort((a, b) => {
      const scoreA = calculateRelevancyScore(a);
      const scoreB = calculateRelevancyScore(b);
      return scoreB - scoreA;
    });

    // Update last visible score for pagination
    if (sortedPosts.length > 0) {
      const lastPost = sortedPosts[sortedPosts.length - 1];
      setLastVisibleScore(calculateRelevancyScore(lastPost));
    }

    return sortedPosts;
  }, [calculateRelevancyScore]);

  // Initial fetch with larger limit
  const fetchInitialPosts = useCallback(async () => {
    if (!postsRef.current) {
      postsRef.current = ref(database, 'posts');
    }

    setInitialLoading(true);
    try {
      const initialQuery = query(
        postsRef.current,
        orderByChild('createdAt'),
        limitToLast(INITIAL_FETCH_LIMIT)
      );

      const snapshot = await get(initialQuery);

      if (!snapshot.exists()) {
        setInitialLoading(false);
        return;
      }

      const fetchedPosts = [];
      snapshot.forEach((childSnapshot) => {
        const post = {
          id: childSnapshot.key,
          ...childSnapshot.val()
        };
        fetchedPosts.push(post);
        allFetchedPosts.current.set(post.id, post);
      });

      // Sort by relevancy and take top POSTS_PER_PAGE posts
      const sortedPosts = sortPostsByRelevancy(fetchedPosts);
      setPosts(sortedPosts.slice(0, POSTS_PER_PAGE));

      if (fetchedPosts.length < INITIAL_FETCH_LIMIT) {
        setNoMorePosts(true);
      }
    } catch (error) {
      console.error("Error fetching initial posts:", error);
    } finally {
      setInitialLoading(false);
    }
  }, [database, sortPostsByRelevancy]);

  // Fetch older posts
  const fetchOlderPosts = useCallback(async () => {
    if (loading || noMorePosts || !lastVisibleScore) return;

    setLoading(true);
    try {
      const timeThreshold = Date.now() - (90 * 24 * 60 * 60 * 1000); // 90 days ago
      const olderPostsQuery = query(
        postsRef.current,
        orderByChild('createdAt'),
        startAfter(timeThreshold),
        limitToLast(POSTS_PER_PAGE * 2) // Fetch more to ensure we get high relevancy posts
      );

      const snapshot = await get(olderPostsQuery);

      if (!snapshot.exists()) {
        setNoMorePosts(true);
        setLoading(false);
        return;
      }

      const newPosts = [];
      snapshot.forEach((childSnapshot) => {
        const post = {
          id: childSnapshot.key,
          ...childSnapshot.val()
        };
        if (!allFetchedPosts.current.has(post.id)) {
          newPosts.push(post);
          allFetchedPosts.current.set(post.id, post);
        }
      });

      if (newPosts.length === 0) {
        setNoMorePosts(true);
        setLoading(false);
        return;
      }

      // Combine with existing posts and sort by relevancy
      const allPosts = Array.from(allFetchedPosts.current.values());
      const sortedPosts = sortPostsByRelevancy(allPosts);
      setPosts(sortedPosts);

      if (newPosts.length < POSTS_PER_PAGE) {
        setNoMorePosts(true);
      }
    } catch (error) {
      console.error("Error fetching older posts:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, noMorePosts, lastVisibleScore, sortPostsByRelevancy]);

  // Delayed sorting effect
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

  // Post deletion handler with optimistic updates
  const handleDeletePost = useCallback(async (postId) => {
    if (!postId) return;

    try {
      const postRef = ref(database, `posts/${postId}`);

      // Optimistic UI update
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));

      // Delete from Firebase
      await remove(postRef);
      postsCache.current.clear();

    } catch (error) {
      console.error("Error deleting post:", error);

      // Rollback on failure
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

  // Batch update handler
  {/*const batchUpdatePosts = useCallback((newPosts) => {
    setPosts(prevPosts => {
      const postsMap = new Map(prevPosts.map(post => [post.id, post]));

      // Update existing posts and add new ones
      newPosts.forEach(post => {
        postsMap.set(post.id, post);
      });

      const updatedPosts = Array.from(postsMap.values());
      return sortPostsByRelevancy(updatedPosts);
    });
  }, [sortPostsByRelevancy]);*/}

  //Real-time updates handler

  const handleRealtimeUpdate = useCallback((snapshot) => {
    if (!snapshot.exists()) return;

    const updatedPost = {
      id: snapshot.key,
      ...snapshot.val()
    };

    allFetchedPosts.current.set(updatedPost.id, updatedPost);
    const allPosts = Array.from(allFetchedPosts.current.values());
    const sortedPosts = sortPostsByRelevancy(allPosts);
    setPosts(sortedPosts);
  }, [sortPostsByRelevancy]);

  // Initialize and set up real-time listeners
  useEffect(() => {
    if (!postsRef.current) {
      postsRef.current = ref(database, 'posts');
    }

    fetchInitialPosts();

    const unsubscribe = onValue(postsRef.current, handleRealtimeUpdate);

    return () => {
      unsubscribe();
      postsCache.current.clear();
      if (sortTimeoutRef.current) {
        clearTimeout(sortTimeoutRef.current);
      }
    };
  }, [database, fetchInitialPosts, handleRealtimeUpdate]);

  // Like handler with optimistic updates
  const handleLike = useCallback(async (postId, currentLikes, likedBy = [], userId) => {
    if (!userId) return;

    const postRef = ref(database, `posts/${postId}`);
    const hasLiked = likedBy.includes(userId);
    const newLikes = hasLiked ? currentLikes - 1 : currentLikes + 1;
    const newLikedBy = hasLiked
      ? likedBy.filter(uid => uid !== userId)
      : [...likedBy, userId];

    // Optimistic update
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
      // Revert on failure
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, likes: currentLikes, likedBy }
            : post
        )
      );
    }
  }, [database]);

  // Manual sort trigger
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
