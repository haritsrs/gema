"use client";

import { db } from '../../firebase.js';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase.js'; // Adjust the path if needed

export default function Posting({ onPostCreated }) {
  const [postContent, setPostContent] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const maxCharacters = 280; // Set your character limit here

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
    });

    return () => unsubscribe();
  }, []);

  // Log user info when it's updated
  useEffect(() => {
    console.log(user);
  }, [user]);

  const handleInputChange = (e) => {
    const input = e.target.value;

    // Check if character count exceeds the limit
    if (input.length <= maxCharacters) {
      setPostContent(input);
      setError(''); // Clear error if within the limit
    } else {
      setError(`You can only enter up to ${maxCharacters} characters.`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postContent.trim() || !user) return;

    const newPost = {
      content: postContent,
      createdAt: Timestamp.fromDate(new Date()),
      userId: user.uid,
      username: user.displayName || user.email,
      profilePicture: user.photoURL || 'https://placehold.co/40x40',
      likes: 0,
      comments: []
    };

    try {
      const docRef = await addDoc(collection(db, 'posts'), newPost);
      setPostContent(''); // Clear the input after submission
      onPostCreated(docRef.id);
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  const handleShare = (postId) => {
    const shareUrl = `${window.location.origin}/posts/${postId}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Post link copied to clipboard!");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <textarea
        className="w-full text-black p-2 border rounded-lg outline outline-2 outline-gray-700 focus:outline-purple-800"
        rows="4"
        value={postContent}
        onChange={handleInputChange}
        placeholder="What's on your mind?"
      />
      {error && <div className="text-red-500">{error}</div>}
      <div className="text-gray-500">
        Character count: {postContent.length}/{maxCharacters}
      </div>
      <button type="submit" className="mt-2 px-12 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-900">
        Post
      </button>
    </form>
  );
}
