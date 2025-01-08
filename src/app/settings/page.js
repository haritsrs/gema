"use client";

import { useState, useEffect } from 'react';
import { getAuth, updateProfile, updateEmail, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref as databaseRef, update, get } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../../../firebase';
import SettingsView from '../../views/settingsView';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  
  const [userData, setUserData] = useState({
    username: '',
    displayName: '',
    profilePicture: '',
    email: '',
    birthday: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  
  const [notifications, setNotifications] = useState({
    emailNotifs: true,
    pushNotifs: true,
    mentionNotifs: true
  });
  const [privacy, setPrivacy] = useState({
    privateAccount: false,
    showOnline: true,
    allowMessages: true
  });
  const [appearance, setAppearance] = useState({
    darkMode: true,
    reducedMotion: false,
    highContrast: false
  });

  const storage = getStorage();
  const database = getDatabase();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) return;
      try {
        const userRef = databaseRef(database, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        const dbData = snapshot.exists() ? snapshot.val() : {};
        
        const currentUsername = dbData.username || `${currentUser.email?.split('@')[0]}`;
        
        setUserData({
          username: currentUsername,
          displayName: currentUser.displayName || '',
          profilePicture: currentUser.photoURL || '',
          email: currentUser.email || '',
          birthday: dbData.birthday || '',
        });

        if (currentUser.photoURL) {
          setImageUrl(currentUser.photoURL);
        }
      } catch (error) {
        setError("Failed to load user data");
      }
    };

    loadUserData();
  }, [currentUser, database]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setSelectedImage(file);
        const imageRef = storageRef(storage, `profile-pictures/${currentUser.uid}`);
        await uploadBytes(imageRef, file);
        const downloadURL = await getDownloadURL(imageRef);
        setImageUrl(downloadURL);
        setUserData(prev => ({ ...prev, profilePicture: downloadURL }));
      } catch (error) {
        setError("Failed to upload image");
      }
    }
  };

  const handleInputChange = (e) => {
    setUserData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdateProfile = async () => {
    if (!currentUser) {
      setError("No user logged in");
      return;
    }

    try {
      setLoading(true);
      await updateProfile(currentUser, { 
        displayName: userData.displayName, 
        photoURL: userData.profilePicture 
      });

      if (userData.email !== currentUser.email) {
        await updateEmail(currentUser, userData.email);
      }

      const userRef = databaseRef(database, `users/${currentUser.uid}`);
      await update(userRef, {
        username: userData.username,
        displayName: userData.displayName,
        birthday: userData.birthday,
        profilePicture: userData.profilePicture,
        email: userData.email
      });

      setError("Profile updated successfully!");
      setTimeout(() => setError(""), 3000);
    } catch (error) {
      setError("Failed to update profile. " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureNotImplemented = () => setShowModal(true);

  const props = {
    activeTab,
    setActiveTab,
    currentUser,
    loading,
    showModal,
    setShowModal,
    error,
    userData,
    imageUrl,
    notifications,
    privacy,
    appearance,
    handleImageChange,
    handleInputChange,
    handleUpdateProfile,
    handleFeatureNotImplemented
  };

  return <SettingsView {...props} />;
}