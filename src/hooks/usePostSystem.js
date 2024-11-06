import { useState, useEffect, useRef, useCallback } from 'react';
import { getDatabase, ref, get, query, orderByChild, limitToLast, endBefore, startAfter, update, onValue, remove } from 'firebase/database';

const POSTS_PER_PAGE = 30;
const TIME_WEIGHT = 1;
const LIKE_WEIGHT = 2;
const CACHE_EXPIRY = 5 * 60 * 1000;
const SORT_DELAY = 500;

const createPostsCache = () => {
  const cache = new Map();
  let lastCleanup = Date.now();

  return {
    get: (key) => {
      const entry = cache.get(key);
      if (entry && Date.now() - entry.timestamp < CACHE_EXPIRY) {
        return entry.value;
      }
      return null;
    },
    set: (key, value) => {
      if (Date.now() - lastCleanup > CACHE_EXPIRY) {
        for (const [k, v] of cache.entries()) {
          if (Date.now() - v.timestamp > CACHE_EXPIRY) {
            cache.delete(k);
          }
        }
        lastCleanup = Date.now();
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
  const [lastVisibleScore, setLastVisibleScore] = useState(null);
  const [noMorePosts, setNoMorePosts] = useState(false);
  const [shouldSort, setShouldSort] = useState(true);
  const [lastTimestamp, setLastTimestamp] = useState(null);
  const [visiblePosts, setVisiblePosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const postsCache = useRef(createPostsCache());
  const postsRef = useRef(null);
  const sortTimeoutRef = useRef(null);
  const isMounted = useRef(true);
  const database = getDatabase();
  const allFetchedPosts = useRef(new Map());
  const fetchedTimestamps = useRef(new Set());

  const calculateRelevancyScore = useCallback((post) => {
    const cacheKey = `relevancy-${post.id}-${post.likes}-${post.createdAt}`;
    const cachedScore = postsCache.current.get(cacheKey);

    if (cachedScore !== null) {
      return cachedScore;
    }

    const now = Date.now();
    const postAge = (now - post.createdAt) / (1000 * 60 * 60);
    const likes = post.likes || 0;

    const score = (1 / Math.pow(postAge + 2, TIME_WEIGHT)) * Math.pow(likes + 1, LIKE_WEIGHT);
    postsCache.current.set(cacheKey, score);

    return score;
  }, []);

  const sortPostsByRelevancy = useCallback((postsToSort) => {
    if (!postsToSort?.length) return [];
    
    const sortedPosts = [...postsToSort].sort((a, b) => {
      const scoreA = calculateRelevancyScore(a);
      const scoreB = calculateRelevancyScore(b);
      return scoreB - scoreA;
    });

    if (sortedPosts.length > 0) {
      const lastPost = sortedPosts[sortedPosts.length - 1];
      setLastVisibleScore(calculateRelevancyScore(lastPost));
    }

    return sortedPosts;
  }, [calculateRelevancyScore]);

  const updateVisiblePosts = useCallback(() => {
    const endIndex = currentPage * POSTS_PER_PAGE;
    const newVisiblePosts = posts.slice(0, endIndex);
    setVisiblePosts(newVisiblePosts);
    setNoMorePosts(endIndex >= posts.length);
  }, [currentPage, posts]);

  const fetchInitialPosts = useCallback(async () => {
    if (!isMounted.current) return;
    
    if (!postsRef.current) {
      postsRef.current = ref(database, 'posts');
    }

    setInitialLoading(true);
    try {
      const initialQuery = query(
        postsRef.current,
        orderByChild('createdAt'),
        limitToLast(POSTS_PER_PAGE)
      );

      const snapshot = await get(initialQuery);

      if (!snapshot.exists()) {
        if (isMounted.current) {
          setInitialLoading(false);
          setNoMorePosts(true);
        }
        return;
      }

      const fetchedPosts = [];
      let oldestTimestamp = Infinity;

      snapshot.forEach((childSnapshot) => {
        const post = {
          id: childSnapshot.key,
          ...childSnapshot.val()
        };
        fetchedPosts.push(post);
        allFetchedPosts.current.set(post.id, post);
        fetchedTimestamps.current.add(post.createdAt);
        oldestTimestamp = Math.min(oldestTimestamp, post.createdAt);
      });

      if (isMounted.current) {
        setLastTimestamp(oldestTimestamp);
        const sortedPosts = sortPostsByRelevancy(fetchedPosts);
        setPosts(sortedPosts);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error fetching initial posts:", error);
    } finally {
      if (isMounted.current) {
        setInitialLoading(false);
      }
    }
  }, [database, sortPostsByRelevancy]);

  const fetchOlderPosts = useCallback(async () => {
    if (loading || noMorePosts || !lastTimestamp || !isMounted.current) return;

    setLoading(true);
    try {
      const olderPostsQuery = query(
        postsRef.current,
        orderByChild('createdAt'),
        endBefore(lastTimestamp),
        limitToLast(POSTS_PER_PAGE)
      );

      const snapshot = await get(olderPostsQuery);
      let hasNewPosts = false;
      let oldestTimestamp = lastTimestamp;

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const post = {
            id: childSnapshot.key,
            ...childSnapshot.val()
          };

          if (!fetchedTimestamps.current.has(post.createdAt)) {
            hasNewPosts = true;
            allFetchedPosts.current.set(post.id, post);
            fetchedTimestamps.current.add(post.createdAt);
            oldestTimestamp = Math.min(oldestTimestamp, post.createdAt);
          }
        });

        if (hasNewPosts && isMounted.current) {
          setLastTimestamp(oldestTimestamp);
          const allPosts = Array.from(allFetchedPosts.current.values());
          const sortedPosts = sortPostsByRelevancy(allPosts);
          setPosts(sortedPosts);
          setCurrentPage(prev => prev + 1);
        }

        setNoMorePosts(!hasNewPosts);
      } else {
        setNoMorePosts(true);
      }
    } catch (error) {
      console.error("Error fetching older posts:", error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [loading, noMorePosts, lastTimestamp, sortPostsByRelevancy]);

  // Update visible posts whenever the main posts array or current page changes
  useEffect(() => {
    updateVisiblePosts();
  }, [posts, currentPage, updateVisiblePosts]);

  const handleRealtimeUpdate = useCallback((snapshot) => {
    if (!snapshot.exists() || !isMounted.current) return;

    const updatedPost = {
      id: snapshot.key,
      ...snapshot.val()
    };

    allFetchedPosts.current.set(updatedPost.id, updatedPost);
    fetchedTimestamps.current.add(updatedPost.createdAt);
    
    if (isMounted.current) {
      const allPosts = Array.from(allFetchedPosts.current.values());
      const sortedPosts = sortPostsByRelevancy(allPosts);
      setPosts(sortedPosts);
    }
  }, [sortPostsByRelevancy]);

  useEffect(() => {
    if (shouldSort) {
      if (sortTimeoutRef.current) {
        clearTimeout(sortTimeoutRef.current);
      }

      sortTimeoutRef.current = setTimeout(() => {
        if (isMounted.current) {
          setPosts(prevPosts => sortPostsByRelevancy(prevPosts));
          setShouldSort(false);
        }
      }, SORT_DELAY);

      return () => {
        if (sortTimeoutRef.current) {
          clearTimeout(sortTimeoutRef.current);
        }
      };
    }
  }, [shouldSort, sortPostsByRelevancy]);

  const handleDeletePost = useCallback(async (postId) => {
    if (!postId) return;

    const deletedPost = allFetchedPosts.current.get(postId);
    if (!deletedPost) return;

    allFetchedPosts.current.delete(postId);
    fetchedTimestamps.current.delete(deletedPost.createdAt);
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));

    try {
      await remove(ref(database, `posts/${postId}`));
      postsCache.current.clear();
    } catch (error) {
      console.error("Error deleting post:", error);

      if (isMounted.current) {
        allFetchedPosts.current.set(postId, deletedPost);
        fetchedTimestamps.current.add(deletedPost.createdAt);
        setPosts(prevPosts => {
          const updatedPosts = [...prevPosts, deletedPost];
          return sortPostsByRelevancy(updatedPosts);
        });
      }
    }
  }, [database, sortPostsByRelevancy]);

  const handleLike = useCallback(async (postId, currentLikes, likedBy = [], userId) => {
    if (!userId || !postId) return;

    const postRef = ref(database, `posts/${postId}`);
    const hasLiked = likedBy.includes(userId);
    const newLikes = hasLiked ? currentLikes - 1 : currentLikes + 1;
    const newLikedBy = hasLiked
      ? likedBy.filter(uid => uid !== userId)
      : [...likedBy, userId];

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
      if (isMounted.current) {
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? { ...post, likes: currentLikes, likedBy }
              : post
          )
        );
      }
    }
  }, [database]);

  useEffect(() => {
    isMounted.current = true;
    
    if (!postsRef.current) {
      postsRef.current = ref(database, 'posts');
    }

    fetchInitialPosts();

    const unsubscribe = onValue(postsRef.current, handleRealtimeUpdate);

    return () => {
      isMounted.current = false;
      unsubscribe();
      postsCache.current.clear();
      fetchedTimestamps.current.clear();
      if (sortTimeoutRef.current) {
        clearTimeout(sortTimeoutRef.current);
      }
    };
  }, [database, fetchInitialPosts, handleRealtimeUpdate]);

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