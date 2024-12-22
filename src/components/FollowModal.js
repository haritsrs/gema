import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const UserList = ({ users, onClose, onAction, modalType }) => {
  const [loadingId, setLoadingId] = useState(null);

  const handleAction = async (userId, e) => {
    e.preventDefault(); // Prevent Link navigation
    setLoadingId(userId);
    try {
      await onAction(userId);
    } catch (error) {
      console.error(`Failed to ${modalType === 'followers' ? 'remove follower' : 'unfollow'}:`, error);
    } finally {
      setLoadingId(null);
    }
  };

  const getButtonText = (isLoading) => {
    if (isLoading) return modalType === 'followers' ? 'Removing...' : 'Unfollowing...';
    return modalType === 'followers' ? 'Remove' : 'Unfollow';
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {users.map((user) => (
        <Link 
          key={user.uid} 
          href={`/profile/${user.uid}`}
          className="flex items-center justify-between p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Image
              src={user.profilePicture || '/img/error.png'}
              alt={user.displayName}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <div className="text-white font-medium">{user.displayName}</div>
              <div className="text-gray-400 text-sm">@{user.email?.split('@')[0]}</div>
            </div>
          </div>
          <button
            onClick={(e) => handleAction(user.uid, e)}
            disabled={loadingId === user.uid}
            className={`px-3 py-1 rounded-full text-sm font-medium 
              ${loadingId === user.uid 
                ? 'bg-gray-700 text-gray-400' 
                : modalType === 'followers'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'} 
              transition-colors duration-200`}
          >
            {getButtonText(loadingId === user.uid)}
          </button>
        </Link>
      ))}
      {users.length === 0 && (
        <div className="text-gray-400 text-center py-4">
          No users to display
        </div>
      )}
    </div>
  );
};

const CustomModal = ({ isOpen, onClose, title, users, onAction, modalType }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-gray-900 rounded-lg w-full max-w-md p-6 border border-gray-800 text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="mb-4 text-xl font-semibold">{title}</div>
        <UserList 
          users={users} 
          onClose={onClose} 
          onAction={onAction}
          modalType={modalType}
        />
      </div>
    </div>
  );
};

export default CustomModal;