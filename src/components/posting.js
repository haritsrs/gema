"use client";

import { db } from '../../firebase.js';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import Image from 'next/image';
import Camera from '../components/Camera';

export default function Posting({ onPostCreated }) {
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(''); // For preview
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isCameraOpen,setIsCameraOpen] = useState (false);
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
      setImageUrl(URL.createObjectURL(file)); // Display image preview
    }
  };

  const handleDeleteImage = () => {
    setSelectedImage(null);
    setImageUrl(''); // Remove preview
  };

  const uploadImage = async (file) => {
    const storageRef = ref(storage, 'images/' + file.name);
    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL; // Return the uploaded image's URL
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload image. Please try again.');
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postContent.trim() && !selectedImage) return; // Require either content or an image
    if (!user) return;

    setLoading(true); // Set loading state while uploading

    let uploadedImageUrl = '';
    if (selectedImage) {
      uploadedImageUrl = await uploadImage(selectedImage); // Upload image and get URL
    }

    const newPost = {
      content: postContent,
      imageUrl: uploadedImageUrl, // Attach image URL if present
      createdAt: Timestamp.fromDate(new Date()),
      userId: user.uid,
      username: user.displayName || user.email,
      profilePicture: user.photoURL || 'https://placehold.co/40x40',
      likes: 0,
      comments: []
    };

    try {
      const docRef = await addDoc(collection(db, 'posts'), newPost);
      setPostContent(''); // Clear content
      handleDeleteImage(); // Clear image preview
      onPostCreated(docRef.id); // Trigger callback for new post
    } catch (error) {
      console.error('Error adding document: ', error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleOpenCamera = () => {
    setIsCameraOpen(true); // Opens the camera
  };

  const handleCloseCamera = () => {
    setIsCameraOpen(false); // Closes the camera
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
      
      <div className="flex space-x-2 justify-start items-center">
        <label htmlFor="image-upload" className="sr-only">Upload Image</label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageChange}
          className="mt-2"
        />
        <button onClick={handleOpenCamera} className="mt-2 bg-gray-700 active:bg-purple-300 active:bg-opacity-50 fill-gray-500 active:fill-purple-500 rounded-lg drop-shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24" className="drop-shadow-md m-1">
            <path d="M14.793 3c.346 0 .682.12.95.34l.11.1L17.415 5H20a2 2 0 0 1 1.995 1.85L22 7v12a2 2 0 0 1-1.85 1.995L20 21H4a2 2 0 0 1-1.995-1.85L2 19V7a2 2 0 0 1 1.85-1.995L4 5h2.586l1.56-1.56c.245-.246.568-.399.913-.433L9.207 3z" className="duoicon-secondary-layer" opacity={0.5}>
            </path>
            <path d="M12 7.5c-3.849 0-6.255 4.167-4.33 7.5A5 5 0 0 0 12 17.5c3.849 0 6.255-4.167 4.33-7.5A5 5 0 0 0 12 7.5" className="duoicon-primary-layer">
            </path>
          </svg>
        </button>
      </div>

      {imageUrl && (
        <div className="relative mt-2">
          <Image
            src={imageUrl}
            alt="Selected"
            width={300}
            height={200}
            className="object-cover rounded-md"
          />
          <button 
            type="button" 
            onClick={handleDeleteImage} 
            className="absolute top-0 right-0 bg-red-300 bg-opacity-80 text-red-800 rounded-full p-1"
          >
            X
          </button>
        </div>
      )}

      {/* Include the Camera component for capturing images */}
      {isCameraOpen && (
        <Camera setSelectedImage={setSelectedImage} setImageUrl={setImageUrl} handleCloseCamera={handleCloseCamera} isCameraActive={isCameraOpen} />
      )}
      

      <button type="submit" className="mt-2 px-12 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-300 hover:text-purple-800">
        Post
      </button>
    </form>
  );
}
