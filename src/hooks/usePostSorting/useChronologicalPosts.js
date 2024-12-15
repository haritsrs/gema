import { useState, useEffect } from 'react';
import { getDatabase, ref, query, orderByChild, onValue } from 'firebase/database';
import { usePostSystem } from '../usePostSystem';

export function useChronologicalPosts({ userId = null }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const database = getDatabase();
    const { handleLike, handleDeletePost } = usePostSystem();
  
    useEffect(() => {
      const postsRef = ref(database, 'posts');
      const postsQuery = query(postsRef, orderByChild('createdAt'));
  
      const handlePosts = (snapshot) => {
        if (!snapshot.exists()) {
          setLoading(false);
          setPosts([]);
          return;
        }
  
        const postsData = [];
        snapshot.forEach((childSnapshot) => {
          const post = {
            id: childSnapshot.key,
            ...childSnapshot.val(),
          };
  
          // Optionally filter posts
          if (!userId || post.userId === userId) {
            postsData.push(post);
          }
        });
  
        setPosts(postsData.reverse());
        setLoading(false);
      };
  
      const unsubscribe = onValue(postsQuery, handlePosts);
      return () => unsubscribe();
    }, [database, userId]);
  
    return {
      posts,
      loading,
      handleLike,
      handleDeletePost,
      setPosts,
    };
}
  