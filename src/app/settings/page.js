"use client";

import { useState, useEffect } from 'react';
import { getAuth, updateProfile, updateEmail, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref as databaseRef, update, get } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../../../firebase';
import Image from "next/legacy/image";
import { Bell, Lock, User, PaintBucket } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  
  // Profile state
  const [userData, setUserData] = useState({
    username: '',
    displayName: '',
    profilePicture: '',
    email: '',
    birthday: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  
  // Settings state
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

        // First check database for username, then use current username if it exists, 
        // finally fall back to email-based username
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
      // Update display name in Firebase Auth
      await updateProfile(currentUser, { 
        displayName: userData.displayName, 
        photoURL: userData.profilePicture 
      });

      if (userData.email !== currentUser.email) {
        await updateEmail(currentUser, userData.email);
      }

      // Update both username and display name in Realtime Database
      const userRef = databaseRef(database, `users/${currentUser.uid}`);
      await update(userRef, {
        username: userData.username, // Save username to database
        displayName: userData.displayName, // Save display name to database
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

  const SettingsSection = ({ icon: Icon, title, children }) => (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <div className="flex items-center space-x-3 mb-4">
        <Icon className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );

  const SettingsRow = ({ label, description, children }) => (
    <div className="flex items-center justify-between py-3">
      <div className="space-y-1">
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-sm text-gray-400">{description}</p>}
      </div>
      {children}
    </div>
  );

  if (loading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  if (!currentUser) {
    return <div className="text-center p-6">Please log in to view your settings.</div>;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded ${activeTab === 'profile' ? 'bg-purple-600' : 'bg-gray-700'}`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded ${activeTab === 'settings' ? 'bg-purple-600' : 'bg-gray-700'}`}
          >
            Settings
          </button>
        </div>

        {activeTab === 'profile' ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
            
            <div>
              <label className="block mb-2 text-gray-400">Username</label>
              <input
                type="text"
                name="username"
                value={userData.username}
                onChange={handleInputChange}
                className="p-3 border-2 border-gray-700 rounded w-full bg-gray-800 text-white focus:outline-none focus:border-purple-500"
                placeholder="Enter your unique username"
              />
              <p className="mt-1 text-sm text-gray-400">This is your unique identifier that others will use to find you</p>
            </div>

            <div>
              <label className="block mb-2 text-gray-400">Display Name</label>
              <input
                type="text"
                name="displayName"
                value={userData.displayName}
                onChange={handleInputChange}
                className="p-3 border-2 border-gray-700 rounded w-full bg-gray-800 text-white focus:outline-none focus:border-purple-500"
                placeholder="Enter your display name"
              />
              <p className="mt-1 text-sm text-gray-400">This is the name that will be displayed to others</p>
            </div>

            <div>
              <label className="block mb-2 text-gray-400">Email</label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                className="p-3 border-2 border-gray-700 rounded w-full bg-gray-800 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
      <label className="block mb-2 text-gray-400">Birthday</label>
      <input
        type="date"
        name="birthday"
        value={userData.birthday || ''}
        onChange={handleInputChange}
        className="p-3 border-2 border-gray-700 rounded w-full bg-gray-800 text-white focus:outline-none focus:border-purple-500"
      />
      {userData.birthday && (
        <p className="mt-1 text-sm text-gray-400">
          Current birthday: {new Date(userData.birthday).toLocaleDateString()}
        </p>
      )}
    </div>

            <div>
              <label className="block mb-2 text-gray-400">Profile Picture</label>
              <div className="flex items-center">
                <label
                  htmlFor="profile-picture"
                  className="px-4 py-2 bg-gray-800 text-gray-400 rounded cursor-pointer hover:bg-gray-700"
                >
                  Choose File
                </label>
                <input
                  id="profile-picture"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="Profile Picture"
                    width={100}
                    height={100}
                    className="rounded-full ml-4"
                  />
                ) : (
                  <p className="ml-4 text-gray-500">No profile picture available</p>
                )}
              </div>
            </div>

            <button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="w-full py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <SettingsSection icon={Bell} title="Notifications">
              <div className="space-y-4 divide-y divide-gray-700">
                <SettingsRow 
                  label="Email Notifications"
                  description="Receive email updates about activity"
                >
                  <Switch 
                    checked={notifications.emailNotifs}
                    onCheckedChange={handleFeatureNotImplemented}
                  />
                </SettingsRow>

                <SettingsRow 
                  label="Push Notifications"
                  description="Receive notifications on your device"
                >
                  <Switch 
                    checked={notifications.pushNotifs}
                    onCheckedChange={handleFeatureNotImplemented}
                  />
                </SettingsRow>
              </div>
            </SettingsSection>

            <SettingsSection icon={Lock} title="Privacy">
              <div className="space-y-4 divide-y divide-gray-700">
                <SettingsRow 
                  label="Private Account"
                  description="Only approved followers can see your posts"
                >
                  <Switch 
                    checked={privacy.privateAccount}
                    onCheckedChange={handleFeatureNotImplemented}
                  />
                </SettingsRow>

                <SettingsRow 
                  label="Online Status"
                  description="Show when you're active"
                >
                  <Switch 
                    checked={privacy.showOnline}
                    onCheckedChange={handleFeatureNotImplemented}
                  />
                </SettingsRow>
              </div>
            </SettingsSection>

            <SettingsSection icon={PaintBucket} title="Appearance">
              <div className="space-y-4 divide-y divide-gray-700">
                <SettingsRow 
                  label="Dark Mode"
                  description="Use dark theme"
                >
                  <Switch 
                    checked={appearance.darkMode}
                    onCheckedChange={handleFeatureNotImplemented}
                  />
                </SettingsRow>

                <SettingsRow 
                  label="Reduced Motion"
                  description="Minimize animations"
                >
                  <Switch 
                    checked={appearance.reducedMotion}
                    onCheckedChange={handleFeatureNotImplemented}
                  />
                </SettingsRow>
              </div>
            </SettingsSection>

            <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
              <h3 className="text-red-400 font-semibold mb-4">Danger Zone</h3>
              <div className="space-y-4">
                <button 
                  className="w-full bg-red-800 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition"
                  onClick={handleFeatureNotImplemented}
                >
                  Deactivate Account
                </button>
                <button 
                  className="w-full bg-red-900 hover:bg-red-800 text-white px-4 py-3 rounded-lg transition"
                  onClick={handleFeatureNotImplemented}
                >
                  Delete Account
                </button>
              </div>
            </div>
            <button 
              className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition"
              onClick={() => window.location.href = '/about-me'}
            >
              About Me
            </button>
          </div>
        )}

        {error && (
          <p className={`text-white bg-green-500 p-3 rounded mt-4 ${error ? 'block' : 'hidden'}`}>
            {error}
          </p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg space-y-4 max-w-xs w-full">
            <p className="text-center">This feature is not implemented yet, try again later.</p>
            <button 
              onClick={() => setShowModal(false)} 
              className="w-full bg-purple-500 hover:bg-purple-400 py-2 rounded-lg transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}