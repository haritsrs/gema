"use client";

import { db } from '../../firebase.js';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import Image from 'next/image';
import Camera from '../components/camera';

export default function Posting({ onPostCreated }) {
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const maxCharacters = 280; // Character limit

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log(user);
  }, [user]);

  const storage = getStorage();

  const handleInputChange = (e) => {
    const input = e.target.value;

    if (input.length <= maxCharacters) {
      setPostContent(input);
      setError('');
    } else {
      setError(`You can only enter up to ${maxCharacters} characters.`);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleDeleteImage = () => {
    setSelectedImage(null);
    setImageUrl('');
  };

  const uploadImage = async (file) => {
    const storageRef = ref(storage, 'images/' + file.name);
    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload image. Please try again.'); // Display error
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postContent.trim() && !selectedImage) return;
    if (!user) return;
  
    setLoading(true); // Set loading to true before uploading
  
    let uploadedImageUrl = '';
    if (selectedImage) {
      uploadedImageUrl = await uploadImage(selectedImage); // Ensure this returns the correct URL
    }
  
    const newPost = {
      content: postContent,
      imageUrl: uploadedImageUrl, // Use the correct image URL
      createdAt: Timestamp.fromDate(new Date()),
      userId: user.uid,
      username: user.displayName || user.email,
      profilePicture: user.photoURL || 'https://placehold.co/40x40',
      likes: 0,
      comments: []
    };
  
    try {
      const docRef = await addDoc(collection(db, 'posts'), newPost);
      setPostContent('');
      handleDeleteImage();
      onPostCreated(docRef.id);
    } catch (error) {
      console.error('Error adding document: ', error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      {loading && <p>Loading...</p>}
      <label htmlFor="post-content" className="sr-only">Post Content</label>
      <textarea
        id="post-content"
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

      <label htmlFor="image-upload" className="sr-only">Upload Image</label>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageChange}
        className="mt-2 text-gray-700"
      />
      {imageUrl && (
        <div className="relative mt-2">
          <Image
            src={imageUrl}
            alt="Selected"
            width={300}
            height={200}
            className="object-cover rounded"
          />
          <button 
            type="button" 
            onClick={handleDeleteImage} 
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
          >
            X
          </button>
        </div>
      )}

      {/* Include the Camera component for capturing images */}
      <Camera setSelectedImage={setSelectedImage} setImageUrl={setImageUrl} />

      <button type="submit" className="mt-2 px-12 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-300 hover:text-purple-800">
        Post
      </button>
    </form>
  );
}
