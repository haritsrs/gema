// components/PostDropdown.js
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

const PostDropdown = ({ post, currentUser, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isOwnPost = currentUser?.uid === post.userId;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOwnPost) return null;

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
                if (window.confirm('Are you sure you want to delete this post?')) {
                  onDelete(post.id);
                }
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
            >
              Delete Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDropdown;