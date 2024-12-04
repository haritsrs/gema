"use client"; 

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Lock, User, Eye, Globe, Shield, Volume2, PaintBucket, Moon } from 'lucide-react';
import { Switch } from '../../components/ui/switch';

const SettingsPage = () => {
  const router = useRouter(); 

  const [notifications, setNotifications] = useState({
    emailNotifs: true,
    pushNotifs: true,
    mentionNotifs: true,
    followNotifs: false,
    messageNotifs: true
  });

  const [privacy, setPrivacy] = useState({
    privateAccount: false,
    showOnline: true,
    allowMessages: true,
    allowTags: true
  });

  const [appearance, setAppearance] = useState({
    darkMode: true,
    reducedMotion: false,
    highContrast: false
  });

  const [showModal, setShowModal] = useState(false); // State to control modal visibility

  const handleFeatureNotImplemented = () => {
    setShowModal(true); // Show modal when feature is not implemented
  };

  const closeModal = () => setShowModal(false); // Hide modal when closed

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
        {description && (
          <p className="text-sm text-gray-400">{description}</p>
        )}
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-6">
          {/* Account Settings */}
          <SettingsSection icon={User} title="Account Settings">
            <div className="space-y-4">
              <button 
                className="w-full bg-gray-700 hover:bg-gray-600 text-left px-4 py-3 rounded-lg transition"
                onClick={() => router.push('/settings/edit-profile')} 
              >
                <p className="font-medium">Edit Profile</p>
                <p className="text-sm text-gray-400">Update your profile information and photo</p>
              </button>
              <button 
                className="w-full bg-gray-700 hover:bg-gray-600 text-left px-4 py-3 rounded-lg transition"
                onClick={handleFeatureNotImplemented} // Show modal on click
              >
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-gray-400">Update your password and security settings</p>
              </button>
            </div>
          </SettingsSection>

          {/* Notification Settings */}
          <SettingsSection icon={Bell} title="Notifications">
            <div className="space-y-4 divide-y divide-gray-700">
              <SettingsRow 
                label="Email Notifications"
                description="Receive email updates about activity"
              >
                <Switch 
                  checked={notifications.emailNotifs}
                  onCheckedChange={() => handleFeatureNotImplemented()} // Show modal on switch toggle
                />
              </SettingsRow>

              <SettingsRow 
                label="Push Notifications"
                description="Receive notifications on your device"
              >
                <Switch 
                  checked={notifications.pushNotifs}
                  onCheckedChange={() => handleFeatureNotImplemented()} // Show modal on switch toggle
                />
              </SettingsRow>

              <SettingsRow 
                label="Mentions"
                description="Get notified when someone mentions you"
              >
                <Switch 
                  checked={notifications.mentionNotifs}
                  onCheckedChange={() => handleFeatureNotImplemented()} // Show modal on switch toggle
                />
              </SettingsRow>
            </div>
          </SettingsSection>

          {/* Privacy Settings */}
          <SettingsSection icon={Lock} title="Privacy">
            <div className="space-y-4 divide-y divide-gray-700">
              <SettingsRow 
                label="Private Account"
                description="Only approved followers can see your posts"
              >
                <Switch 
                  checked={privacy.privateAccount}
                  onCheckedChange={() => handleFeatureNotImplemented()} // Show modal on switch toggle
                />
              </SettingsRow>

              <SettingsRow 
                label="Online Status"
                description="Show when you're active on the platform"
              >
                <Switch 
                  checked={privacy.showOnline}
                  onCheckedChange={() => handleFeatureNotImplemented()} // Show modal on switch toggle
                />
              </SettingsRow>

              <SettingsRow 
                label="Direct Messages"
                description="Allow others to send you messages"
              >
                <Switch 
                  checked={privacy.allowMessages}
                  onCheckedChange={() => handleFeatureNotImplemented()} // Show modal on switch toggle
                />
              </SettingsRow>
            </div>
          </SettingsSection>

          {/* Appearance Settings */}
          <SettingsSection icon={PaintBucket} title="Appearance">
            <div className="space-y-4 divide-y divide-gray-700">
              <SettingsRow 
                label="Dark Mode"
                description="Use dark theme across the application"
              >
                <Switch 
                  checked={appearance.darkMode}
                  onCheckedChange={() => handleFeatureNotImplemented()} // Show modal on switch toggle
                />
              </SettingsRow>

              <SettingsRow 
                label="Reduced Motion"
                description="Minimize animations throughout the interface"
              >
                <Switch 
                  checked={appearance.reducedMotion}
                  onCheckedChange={() => handleFeatureNotImplemented()} // Show modal on switch toggle
                />
              </SettingsRow>

              <SettingsRow 
                label="High Contrast"
                description="Increase contrast for better visibility"
              >
                <Switch 
                  checked={appearance.highContrast}
                  onCheckedChange={() => handleFeatureNotImplemented()} // Show modal on switch toggle
                />
              </SettingsRow>
            </div>
          </SettingsSection>

          {/* Danger Zone */}
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
            <h3 className="text-red-400 font-semibold mb-4">Danger Zone</h3>
            <div className="space-y-4">
              <button 
                className="w-full bg-red-800 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition"
                onClick={handleFeatureNotImplemented} // Show modal on click
              >
                Deactivate Account
              </button>
              <button 
                className="w-full bg-red-900 hover:bg-red-800 text-white px-4 py-3 rounded-lg transition"
                onClick={handleFeatureNotImplemented} // Show modal on click
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg space-y-4 max-w-xs w-full">
            <p className="text-center">This feature is not implemented yet, try again later.</p>
            <button 
              onClick={closeModal} 
              className="w-full bg-purple-500 hover:bg-purple-400 py-2 rounded-lg transition">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
