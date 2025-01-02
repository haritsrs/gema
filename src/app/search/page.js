"use client";

import {  useEffect } from 'react';
import { useAuth } from "../../hooks/useAuth";
import localFont from "next/font/local";
import { useImageDimensions } from '../../hooks/useImageDimensions';
import { useSharePost } from "../../hooks/useSharePost";
import { usePostSystem } from '../../hooks/usePostSystem.js';
import { useSearchPosts } from '../../hooks/useSearchPosts';
import SearchView from '../../views/searchView';

const inter = localFont({
  src: "../fonts/Inter-VariableFont_opsz,wght.ttf",
  variable: "--font-inter",
  weight: "100 900",
});

export default function SearchPage() {
  const { user:currentUser } = useAuth();
  const { imageDimensions, handleImageLoad } = useImageDimensions();
  const handleShare = useSharePost();
  const { formatTimestamp } = usePostSystem();
  const {
    loading,
    searchResults,
    searchTerm,
    setSearchTerm
  } = useSearchPosts();
  
  return (
    <SearchView
      inter={inter}
      loading={loading}
      searchResults={searchResults}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      currentUser={currentUser}
      imageDimensions={imageDimensions}
      handleImageLoad={handleImageLoad}
      handleShare={handleShare}
      formatTimestamp={formatTimestamp}
    />
  );
}