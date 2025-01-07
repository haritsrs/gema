import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const UserList = ({ users, onClose, onAction, modalType, currentUserId }) => {
  const [loadingId, setLoadingId] = useState(null);
  const router = useRouter();

  const handleAction = async (userId, e) => {
    e.preventDefault();
    setLoadingId(userId);
    try {
      await onAction(userId);
    } catch (error) {
      console.error('Failed to unfollow:', error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {users.map((user) => (
        <div key={user.uid} className="flex items-center justify-between p-2 hover:bg-gray-800 rounded-lg">
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => {
              router.push(`/profile/${user.uid}`);
              onClose();
            }}
          >
            <Image
              src={user.photoURL || '/img/error.png'}
              alt={user.displayName}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <div className="text-white font-medium">{user.displayName}</div>
              <div className="text-gray-400 text-sm">@{user.userName}</div>
            </div>
          </div>
          {modalType === 'following' && user.uid !== currentUserId && (
            <button
              onClick={(e) => handleAction(user.uid, e)}
              disabled={loadingId === user.uid}
              className={`px-3 py-1 rounded-full text-sm font-medium 
                ${loadingId === user.uid 
                  ? 'bg-gray-700 text-gray-400' 
                  : 'bg-gray-600 hover:bg-gray-700 text-white'} 
                transition-colors duration-200`}
            >
              {loadingId === user.uid ? 'Unfollowing...' : 'Unfollow'}
            </button>
          )}
        </div>
      ))}
      {users.length === 0 && (
        <div className="text-gray-400 text-center py-4">
          No users to display
        </div>
      )}
    </div>
  );
};

export function FollowersModal({ isOpen, onClose, users }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 rounded-lg w-full max-w-md p-6 border border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Followers</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <UserList 
          users={users} 
          onClose={onClose}
          modalType="followers"
        />
      </div>
    </div>
  );
}

export function FollowingModal({ isOpen, onClose, users, onUnfollow, currentUserId }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 rounded-lg w-full max-w-md p-6 border border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Following</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <UserList 
          users={users} 
          onClose={onClose} 
          onAction={onUnfollow}
          modalType="following"
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}