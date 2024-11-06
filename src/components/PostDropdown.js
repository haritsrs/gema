import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, X } from 'lucide-react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, get, update } from 'firebase/database';

const DeleteDialog = ({ isOpen, onClose, onConfirm, currentUser, post }) => {
  if (!isOpen) return null;

  const isAdmin = currentUser?.admin === 'yes';
  const isOwnPost = currentUser?.uid === post.userId;

  const handleConfirm = () => {
    if (isAdmin || isOwnPost) {
      onConfirm(post.id);
    } else {
      // Show an error message or do nothing
      alert('You do not have permission to delete this post.');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-300"
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
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const PostDropdown = ({ post, currentUser, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userData, setUserData] = useState(null);
  const dropdownRef = useRef(null);

  const isAdmin = userData?.admin === 'yes';
  const isOwnPost = currentUser?.uid === post.userId;

  useEffect(() => {
    const auth = getAuth();
    const database = getDatabase();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val();
        setUserData(userData);
      } else {
        setUserData(null);
      }
    });

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      unsubscribe();
    };
  }, []);

  if (!isAdmin && !isOwnPost) return null;

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
        </div>
      )}

      <DeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={onDelete}
        currentUser={userData}
        post={post}
      />
    </div>
  );
};

export default PostDropdown;