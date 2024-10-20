"use client";

import { db } from '../../firebase.js';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase.js'; // Adjust the path if needed
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Firebase Storage
import Image from 'next/image';

export default function Posting({ onPostCreated }) {
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); // Image upload state
  const [imageUrl, setImageUrl] = useState(''); // Image URL after upload
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

  const storage = getStorage();
  
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file); // Set the selected image
      setImageUrl(URL.createObjectURL(file)); // Create a URL for the image preview
    }
  };

  const handleDeleteImage = () => {
    setSelectedImage(null); // Clear selected image
    setImageUrl(''); // Clear the preview URL
  };

  const uploadImage = async (file) => {
  const storageRef = ref(storage, 'images/' + file.name); // Create a reference to your storage location
  try {
    await uploadBytes(storageRef, file); // Upload the file
    console.log('File uploaded successfully');
  } catch (error) {
    console.error('Error uploading file:', error);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postContent.trim() && !selectedImage) return;
    if (!user) return;

    let uploadedImageUrl = '';

    if (selectedImage) {
      uploadedImageUrl = await uploadImage(selectedImage); // Upload image and get URL
    }

    const newPost = {
      content: postContent,
      imageUrl: uploadedImageUrl, // Save image URL to Firestore
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
      handleDeleteImage(); // Clear image after upload
      onPostCreated(docRef.id);
    } catch (error) {
      console.error('Error adding document: ', error);
    }
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

      {/* Image upload input */}
      <input
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
      
      <button type="submit" className="mt-2 px-12 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-300 hover:text-purple-800">
        Post
      </button>
    </form>
  );
}
