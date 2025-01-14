import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, X, UserPlus, BellOff, Ban, Flag } from 'lucide-react';
import { getDatabase, ref, remove, get, onValue, off } from 'firebase/database';

const DeleteDialog = ({ isOpen, onClose, userData, post, onPostDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  if (!isOpen) return null;

  const handleDelete = async () => {
    const isAdmin = userData?.admin === true;
    const isOwnPost = userData?.uid === post.userId;
    
    if (!isAdmin && !isOwnPost) {
      alert('You do not have permission to delete this post.');
      onClose();
      return;
    }

    try {
      setIsDeleting(true);
      const database = getDatabase();
      const postRef = ref(database, `posts/${post.id}`);
      await remove(postRef);
      
      if (onPostDeleted) {
        onPostDeleted(post.id);
      }
      
      onClose();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-300"
          disabled={isDeleting}
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-semibold text-gray-100 mb-2">
          Delete Post
        </h2>
        
        <p className="text-gray-400 mb-6">
          Are you sure you want to delete this post? This action cannot be undone.
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-700 text-gray-100 hover:bg-gray-600 transition-colors"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const UserInteractionButtons = ({ post, currentUser }) => {
  if (!currentUser || currentUser.uid === post.userId) return null;

  return (
    <div className="py-1">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center space-x-2"
      >
        <UserPlus className="w-4 h-4" />
        <span>Follow User</span>
      </button>
      
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center space-x-2"
      >
        <BellOff className="w-4 h-4" />
        <span>Mute User</span>
      </button>
      
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center space-x-2"
      >
        <Ban className="w-4 h-4" />
        <span>Block User</span>
      </button>
      
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center space-x-2"
      >
        <Flag className="w-4 h-4" />
        <span>Report Post</span>
      </button>
    </div>
  );
};

const PostDropdown = ({ post, currentUser, onPostDeleted }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userData, setUserData] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.uid) return;

      const database = getDatabase();
      try {
        const userRef = ref(database, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        const data = snapshot.val();
        
        const combinedUserData = {
          ...data,
          uid: currentUser.uid
        };
        
        setUserData(combinedUserData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const database = getDatabase();
    const postRef = ref(database, `posts/${post.id}`);
    
    onValue(postRef, (snapshot) => {
      if (!snapshot.exists() && onPostDeleted) {
        onPostDeleted(post.id);
      }
    });

    fetchUserData();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      off(postRef);
    };
  }, [currentUser, post.id, onPostDeleted]);

  const isAdmin = userData?.admin === true;
  const isOwnPost = currentUser?.uid === post.userId;
  const shouldShowDeleteOption = isAdmin || isOwnPost;

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 hover:bg-gray-700 rounded-full transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
          {shouldShowDeleteOption && (
            <div className="py-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
              >
                Delete Post
              </button>
            </div>
          )}
          
          <UserInteractionButtons post={post} currentUser={currentUser} />
        </div>
      )}

      <DeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        userData={userData}
        post={post}
        onPostDeleted={onPostDeleted}
      />
    </div>
  );
};

export default PostDropdown;  