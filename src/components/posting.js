"use client";

import { db } from '../../firebase.js';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import Image from 'next/image';
import Camera from '../components/Camera';
import * as nsfwjs from 'nsfwjs';

export default function Posting({ onPostCreated }) {
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(''); // For preview
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isCameraOpen,setIsCameraOpen] = useState(false);
  const [isUploaderVisible, setIsUploaderVisible] = useState(false);
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
      // Send file to Sharp API for processing
      const formData = new FormData();
      formData.append('file', file);
  
      const response = await fetch('/api/sharp', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        setError('Image compression failed.');
        return '';
      }
  
      // Get optimized image from Sharp API
      const optimizedImageBlob = await response.blob();
      const optimizedFile = new File([optimizedImageBlob], file.name, { type: 'image/jpeg' });
  
      // Upload optimized image to Firebase Storage
      await uploadBytes(storageRef, optimizedFile);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
  
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload image. Please try again.');
      return '';
    }
  };

  const checkImageForNSFW = async (image) => {
    const model = await nsfwjs.load();
    const imageElement = document.createElement('img');
    imageElement.src = URL.createObjectURL(image);
    
    return new Promise((resolve) => {
      imageElement.onload = async () => {
        const predictions = await model.classify(imageElement);
        const isNSFW = predictions.some(prediction => prediction.className === 'Porn' && prediction.probability > 0.8);
        resolve(isNSFW);
      };
      
      // Handle errors in loading the image
      imageElement.onerror = () => {
        resolve(false); // Consider it safe if the image fails to load
      };
    });
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postContent.trim() && !selectedImage) return; // Require either content or an image
    if (!user) return;

    setLoading(true); // Set loading state while uploading

    let uploadedImageUrl = '';
    if (selectedImage) {
      const nsfwDetected = await checkImageForNSFW(selectedImage);
      if (nsfwDetected) {
        setError('NSFW content detected. Please upload a different image.');
        setLoading(false);
        return;
      }
      uploadedImageUrl = await uploadImage(selectedImage);
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
    setIsCameraOpen(true); 
  };

  const handleCloseCamera = () => {
    setIsCameraOpen(false); 
  };

  const showUploader = () => {
    setIsUploaderVisible(!isUploaderVisible);
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

      <div className="flex items-center justify-between mx-1"> 
        <div className="flex space-x-2 justify-start items-center">
          <button onClick={showUploader} className="mt-2 bg-gray-700 active:bg-purple-300 active:bg-opacity-50 fill-gray-400 active:fill-purple-500 rounded-lg drop-shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24" className="drop-shadow-md m-1">
              <path d="M13.5 9a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3" opacity={0.25}>
              </path>
              <path d="M19 2H5a3.01 3.01 0 0 0-3 3v8.86l3.88-3.88a3.075 3.075 0 0 1 4.24 0l2.871 2.887l.888-.888a3.01 3.01 0 0 1 4.242 0L22 15.86V5a3.01 3.01 0 0 0-3-3m-5.5 7a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3" opacity={0.5}>
              </path>
              <path d="M10.12 9.98a3.075 3.075 0 0 0-4.24 0L2 13.86V19a3.01 3.01 0 0 0 3 3h14a3 3 0 0 0 2.16-.92z">
              </path>
              <path d="m22 15.858l-3.879-3.879a3.01 3.01 0 0 0-4.242 0l-.888.888l8.165 8.209c.542-.555.845-1.3.844-2.076z" opacity={0.25}>
              </path>
            </svg>
          </button>
          <button onClick={handleOpenCamera} className="mt-2 bg-gray-700 active:bg-purple-300 active:bg-opacity-50 fill-gray-400 active:fill-purple-500 rounded-lg drop-shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24" className="drop-shadow-md m-1">
              <path d="M14.793 3c.346 0 .682.12.95.34l.11.1L17.415 5H20a2 2 0 0 1 1.995 1.85L22 7v12a2 2 0 0 1-1.85 1.995L20 21H4a2 2 0 0 1-1.995-1.85L2 19V7a2 2 0 0 1 1.85-1.995L4 5h2.586l1.56-1.56c.245-.246.568-.399.913-.433L9.207 3z" className="duoicon-secondary-layer" opacity={0.5}>
              </path>
              <path d="M12 7.5c-3.849 0-6.255 4.167-4.33 7.5A5 5 0 0 0 12 17.5c3.849 0 6.255-4.167 4.33-7.5A5 5 0 0 0 12 7.5" className="duoicon-primary-layer">
              </path>
            </svg>
          </button>
        </div>

        <div className="text-gray-500 items-center">
          {postContent.length} / {maxCharacters}
        </div>
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

      {isUploaderVisible && !isCameraOpen && (
        
      <div class="flex items-center justify-center w-full mt-2">
        <label for="image-upload" class="flex flex-col items-center justify-center w-full h-64 border border-gray-500 rounded-lg cursor-pointer bg-gray-950 hover:border-purple-800 hover:bg-purple-300 hover:bg-opacity-30 fill-gray-400 hover:fill-purple-500 text-gray-400 hover:text-purple-500">
        <div class="flex flex-col items-center justify-center pt-5 pb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="2.3rem" height="2.3rem" viewBox="0 0 24 24" className="drop-shadow-md m-2">
                <path d="m15.707 5.293l-3-3a1 1 0 0 0-1.414 0l-3 3a1 1 0 0 0 1.414 1.414L11 5.414V17a1 1 0 0 0 2 0V5.414l1.293 1.293a1 1 0 0 0 1.414-1.414">
                </path>
                <path d="M18 9h-5v8a1 1 0 0 1-2 0V9H6a3.003 3.003 0 0 0-3 3v7a3.003 3.003 0 0 0 3 3h12a3.003 3.003 0 0 0 3-3v-7a3.003 3.003 0 0 0-3-3" opacity={0.5}>
                </path>
              </svg>
            <p class="mb-2 text-sm">
              <span class="font-semibold">
                Click to upload
              </span> or drag and drop
            </p>
            <p class="text-xs">
              SVG, PNG, JPG or GIF
            </p>
        </div>
        <input id="image-upload" type="file" accept="image/*" capture="environment" onChange={handleImageChange} class="hidden" />
        </label>
      </div> 

      )}

      {isCameraOpen && (
        <Camera setSelectedImage={setSelectedImage} setImageUrl={setImageUrl} handleCloseCamera={handleCloseCamera} isCameraActive={isCameraOpen} />
      )}
      

      <button type="submit" className="mt-2 px-12 py-2 bg-purple-800 text-white rounded-lg hover:bg-purple-300 hover:text-purple-800">
        Post
      </button>
    </form>
  );
}
