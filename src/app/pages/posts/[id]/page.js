"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function PostPage() {
  const router = useRouter();
  const { id } = router.query; // Get post ID from the URL
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const postRef = doc(db, 'posts', id);
          const postSnap = await getDoc(postRef);

          if (postSnap.exists()) {
            setPost(postSnap.data());
          } else {
            console.error('No such document!');
          }
        } catch (error) {
          console.error('Error fetching post:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchPost();
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;

  if (!post) return <div>Post not found</div>;

  return (
    <div className="text-white p-4">
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="flex items-center space-x-2">
          <img
            src={post.profilePicture || 'https://placehold.co/40x40'}
            alt={`${post.username || 'User'}'s profile`}
            className="rounded-full"
            style={{ width: '40px', height: '40px' }}
          />
          <div>
            <div className="font-bold">{post.username || 'User'}</div>
          </div>
        </div>
        <div className="mt-4">{post.content}</div>
        <div className="mt-4 text-gray-500">{post.likes} Likes</div>
      </div>
    </div>
  );
}
