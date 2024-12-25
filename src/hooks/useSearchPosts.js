import { useState, useEffect } from 'react';
import { getDatabase, ref, query, orderByChild, onValue } from 'firebase/database';

export function useSearchPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const database = getDatabase();

  useEffect(() => {
    const postsRef = ref(database, 'posts');
    const postsQuery = query(postsRef, orderByChild('createdAt'));

    const handlePosts = (snapshot) => {
      if (!snapshot.exists()) {
        setLoading(false);
        return;
      }

      const postsData = [];
      snapshot.forEach((childSnapshot) => {
        postsData.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });

      setPosts(postsData.reverse());
      setLoading(false);
    };

    const unsubscribe = onValue(postsQuery, handlePosts);
    return () => unsubscribe();
  }, [database]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    const results = posts.filter(post => {
      const content = post.content?.toLowerCase() || '';
      const username = post.username?.toLowerCase() || '';
      const searchLower = searchTerm.toLowerCase();
      return content.includes(searchLower) || username.includes(searchLower);
    });

    setSearchResults(results);
  }, [searchTerm, posts]);

  return {
    posts,
    loading,
    searchResults,
    searchTerm,
    setSearchTerm
  };
}