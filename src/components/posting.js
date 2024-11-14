"use client";

import { getDatabase, ref as databaseRef, push, serverTimestamp } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase.js';
import Image from "next/legacy/image";
import Camera from '../components/Camera';
import LoadingOverlay from './LoadingOverlay';
import { isSensitiveContentPresent } from './filter/sensitiveWordFilter.js';


function isMobileUserAgent(userAgent) {
  const mobileOSPatterns = /Android|iPhone|iPad|iPod|iOS/i;
  return mobileOSPatterns.test(userAgent);
}

export default function Posting({ onPostCreated }) {
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isUploaderVisible, setIsUploaderVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const maxCharacters = 280;
  const storage = getStorage();
  const database = getDatabase();
  const [isMobile, setIsMobile] = useState(false);


  useEffect(() => {
    setIsMobile(isMobileUserAgent(navigator.userAgent));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
    });

    return () => unsubscribe();
  }, []);

  const showLoginWarning = () => {
    if (!user) {
      setShowAuthWarning(true);
      setTimeout(() => setShowAuthWarning(false), 3000);
      return true;
    }
    return false;
  };

  const handleInputChange = (e) => {
    if (showLoginWarning()) return;

    const input = e.target.value;
    if (input.length <= maxCharacters) {
      setPostContent(input);
      setError('');
    } else {
      setError(`You can only enter up to ${maxCharacters} characters.`);
    }
  };

  const handleImageChange = (e) => {
    if (showLoginWarning()) return;

    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleDeleteImage = () => {
    if (showLoginWarning()) return;

    setSelectedImage(null);
    setImageUrl('');
  };

  const uploadImage = async (file) => {
    if (showLoginWarning()) return '';

    const imageRef = storageRef(storage, `images/${Date.now()}-${file.name}`);

    try {
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

      const optimizedImageBlob = await response.blob();
      const optimizedFile = new File([optimizedImageBlob], file.name, { type: 'image/jpeg' });

      const snapshot = await uploadBytes(imageRef, optimizedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload image. Please try again.');
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (showLoginWarning()) return;

    if (!postContent.trim() && !selectedImage) return;
    if (!user) return;

    if (isSensitiveContentPresent(postContent)) {
      setError('Your post contains content that violates our community guidelines. Please revise and try again.');
      setTimeout(() => {
        setError('')
      }, 3000);
      return;
    }

    setLoading(true);

    try {
      let uploadedImageUrl = '';
      if (selectedImage) {
        uploadedImageUrl = await uploadImage(selectedImage);
      }

      const newPost = {
        content: postContent.trim(),
        imageUrl: uploadedImageUrl,
        createdAt: serverTimestamp(),
        userId: user.uid,
        username: user.displayName || user.email,
        profilePicture: user.photoURL || '/img/placehold.png',
        likes: 0,
        likedBy: []
      };

      const postsRef = databaseRef(database, 'posts');
      await push(postsRef, newPost);

      setPostContent('');
      handleDeleteImage();
      if (onPostCreated) onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
      setTimeout(() => {
        setError('')
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const showUploader = (e) => {
    e.preventDefault();
    if (showLoginWarning()) return;

    setIsUploaderVisible(!isUploaderVisible);
  };

  const handleOpenCamera = (e) => {
    e.preventDefault();
    if (showLoginWarning()) return;

    setIsCameraOpen(true);
  };

  const handleCloseCamera = () => {
    if (showLoginWarning()) return;

    setIsCameraOpen(false);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6 relative">
        {showAuthWarning && (
          <div className="absolute top-0 left-0 right-0 bg-yellow-500 text-yellow-900 p-2 rounded-t-lg text-center animate-fade-in">
            Please log in to create a post
          </div>
        )}

        <div className="relative"></div>
        <LoadingOverlay isLoading={loading} />
        <label htmlFor="post-content" className="sr-only">Post Content</label>
        <textarea
          id="post-content"
          className={`w-full bg-gray-700 p-2 rounded-lg drop-shadow-md focus:ring-2 focus:ring-purple-600 outline outline-none ${user ? 'text-white' : 'text-gray-400'}`}
          rows="4"
          value={postContent}
          onChange={handleInputChange}
          placeholder={user ? "What's on your mind?" : "Please log in to create a post"}
          disabled={!user}
        />

        {error && <div className="text-red-500">{error}</div>}

        <div className="flex items-center justify-between mx-1">
          <div className="flex space-x-2 justify-start items-center">
            {isMobile ? (
              <label
                type="button"
                htmlFor="upload-image-mobile"
                className={`mt-2 rounded-lg drop-shadow-md ${user ? 'bg-gray-700 active:bg-purple-300 active:bg-opacity-50 fill-gray-400 active:fill-purple-500' : 'bg-gray-400 fill-gray-600 cursor-not-allowed'}`}
                disabled={!user}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24" className="drop-shadow-md m-1">
                  <path d="M13.5 9a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3" opacity={0.25}></path>
                  <path d="M19 2H5a3.01 3.01 0 0 0-3 3v8.86l3.88-3.88a3.075 3.075 0 0 1 4.24 0l2.871 2.887l.888-.888a3.01 3.01 0 0 1 4.242 0L22 15.86V5a3.01 3.01 0 0 0-3-3m-5.5 7a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3" opacity={0.5}></path>
                  <path d="M10.12 9.98a3.075 3.075 0 0 0-4.24 0L2 13.86V19a3.01 3.01 0 0 0 3 3h14a3 3 0 0 0 2.16-.92z"></path>
                  <path d="m22 15.858l-3.879-3.879a3.01 3.01 0 0 0-4.242 0l-.888.888l8.165 8.209c.542-.555.845-1.3.844-2.076z" opacity={0.25}></path>
                </svg>
                <input
                  id="upload-image-mobile"
                  type="file"
                  accept=".png, .jpg, .jpeg, .svg, .gif"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith("image/")) {
                      handleImageChange(e);
                    } else {
                      setError("Please upload an image file (JPG, JPEG, PNG, SVG, GIF)");
                      setTimeout(() => {
                        setError('')
                      }, 3000);
                      e.target.value = null;
                    }
                  }}
                  className="hidden"
                  disabled={!user}
                />
              </label>
            ) : (
              <button
                type="button"
                onClick={showUploader}
                className={`mt-2 rounded-lg drop-shadow-md ${user ? 'bg-gray-700 active:bg-purple-300 active:bg-opacity-50 fill-gray-400 active:fill-purple-500' : 'bg-gray-400 fill-gray-600 cursor-not-allowed'}`}
                disabled={!user}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24" className="drop-shadow-md m-1">
                  <path d="M13.5 9a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3" opacity={0.25}></path>
                  <path d="M19 2H5a3.01 3.01 0 0 0-3 3v8.86l3.88-3.88a3.075 3.075 0 0 1 4.24 0l2.871 2.887l.888-.888a3.01 3.01 0 0 1 4.242 0L22 15.86V5a3.01 3.01 0 0 0-3-3m-5.5 7a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3" opacity={0.5}></path>
                  <path d="M10.12 9.98a3.075 3.075 0 0 0-4.24 0L2 13.86V19a3.01 3.01 0 0 0 3 3h14a3 3 0 0 0 2.16-.92z"></path>
                  <path d="m22 15.858l-3.879-3.879a3.01 3.01 0 0 0-4.242 0l-.888.888l8.165 8.209c.542-.555.845-1.3.844-2.076z" opacity={0.25}></path>
                </svg>
              </button>
            )}

            {isMobile ? (
              <label
                htmlFor='open-camcorder'
                type="button"
                className={`mt-2 rounded-lg drop-shadow-md ${user ? 'bg-gray-700 active:bg-purple-300 active:bg-opacity-50 fill-gray-400 active:fill-purple-500' : 'bg-gray-400 fill-gray-600 cursor-not-allowed'}`}
                disabled={!user}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24" className="drop-shadow-md m-1">
                  <path d="M14.793 3c.346 0 .682.12.95.34l.11.1L17.415 5H20a2 2 0 0 1 1.995 1.85L22 7v12a2 2 0 0 1-1.85 1.995L20 21H4a2 2 0 0 1-1.995-1.85L2 19V7a2 2 0 0 1 1.85-1.995L4 5h2.586l1.56-1.56c.245-.246.568-.399.913-.433L9.207 3z" className="duoicon-secondary-layer" opacity={0.5}></path>
                  <path d="M12 7.5c-3.849 0-6.255 4.167-4.33 7.5A5 5 0 0 0 12 17.5c3.849 0 6.255-4.167 4.33-7.5A5 5 0 0 0 12 7.5" className="duoicon-primary-layer"></path>
                </svg>
                <input
                  id="open-camcorder"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file && file.type.startsWith("image/")) {
                      handleImageChange(e);
                    } else {
                      setError("Video upload is not supported");
                      setTimeout(() => {
                        setError('')
                      }, 3000);
                      e.target.value = null;
                    }
                  }}
                  className="hidden"
                  disabled={!user}
                />
              </label>
            ) : (
              <button
                type="button"
                onClick={handleOpenCamera}
                className={`mt-2 rounded-lg drop-shadow-md ${user ? 'bg-gray-700 active:bg-purple-300 active:bg-opacity-50 fill-gray-400 active:fill-purple-500' : 'bg-gray-400 fill-gray-600 cursor-not-allowed'}`}
                disabled={!user}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24" className="drop-shadow-md m-1">
                  <path d="M14.793 3c.346 0 .682.12.95.34l.11.1L17.415 5H20a2 2 0 0 1 1.995 1.85L22 7v12a2 2 0 0 1-1.85 1.995L20 21H4a2 2 0 0 1-1.995-1.85L2 19V7a2 2 0 0 1 1.85-1.995L4 5h2.586l1.56-1.56c.245-.246.568-.399.913-.433L9.207 3z" className="duoicon-secondary-layer" opacity={0.5}></path>
                  <path d="M12 7.5c-3.849 0-6.255 4.167-4.33 7.5A5 5 0 0 0 12 17.5c3.849 0 6.255-4.167 4.33-7.5A5 5 0 0 0 12 7.5" className="duoicon-primary-layer"></path>
                </svg>
              </button>
            )}
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

        {isUploaderVisible && !isCameraOpen && !imageUrl && (
          <div className="flex items-center justify-center w-full mt-2">
            <label htmlFor="image-upload" className={`flex flex-col items-center justify-center w-full h-64 border rounded-lg cursor-pointer ${user
              ? 'border-gray-500 bg-gray-950 hover:border-purple-800 hover:bg-purple-300 hover:bg-opacity-30 fill-gray-400 hover:fill-purple-500 text-gray-400 hover:text-purple-500'
              : 'border-gray-400 bg-gray-100 cursor-not-allowed text-gray-400 fill-gray-400'
              }`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="2.3em" height="2.3em" viewBox="0 0 24 24">
                  <path d="M22 16v-1c0-2.829 0-4.242-.879-5.121S18.828 9 16 9H8c-2.83 0-4.243 0-5.122.88C2 10.757 2 12.17 2 14.998V16c0 2.828 0 4.242.879 5.121C3.757 22 5.172 22 8 22h8c2.828 0 4.243 0 5.121-.879S22 18.828 22 16" opacity={0.5}></path>
                  <path fillRule="evenodd" d="M12 15.75a.75.75 0 0 0 .75-.75V4.027l1.68 1.961a.75.75 0 1 0 1.14-.976l-3-3.5a.75.75 0 0 0-1.14 0l-3 3.5a.75.75 0 1 0 1.14.976l1.68-1.96V15c0 .414.336.75.75.75" clipRule="evenodd"></path>
                </svg>
                <p className="mb-2 text-sm">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs">SVG, PNG, JPG or GIF</p>
              </div>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file && file.type.startsWith("image/")) {
                    handleImageChange(e);
                  } else {
                    setError("Please upload an image file (JPG, JPEG, PNG, SVG, GIF)");
                    setTimeout(() => {
                      setError('')
                    }, 3000);
                    e.target.value = null;
                  }
                }}
                className="hidden"
                disabled={!user}
              />
            </label>
          </div>
        )}

        {isCameraOpen && (
          <Camera
            setSelectedImage={setSelectedImage}
            setImageUrl={setImageUrl}
            handleCloseCamera={handleCloseCamera}
            isCameraActive={isCameraOpen}
          />
        )}

        <button
          type="submit"
          className={`mt-2 px-12 py-2 rounded-lg ${user
            ? 'bg-purple-800 text-white hover:bg-purple-300 hover:text-purple-800'
            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
          disabled={loading || !user || (!postContent.trim() && !selectedImage)}
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
}
