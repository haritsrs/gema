"use client";

import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebase.js';
import localFont from "next/font/local";
import Link from 'next/link';
import Image from 'next/legacy/image';
import LoadingOverlay from '../../components/LoadingOverlay';
import { useChronologicalPosts } from '../../hooks/usePostSorting/useChronologicalPosts';
import { useFollow } from '../../hooks/useProfile/useFollow';
import PostDropdown from '../../components/PostDropdown';
import { useImageDimensions } from '../../hooks/useImageDimensions';
import { useSharePost } from '../../hooks/useSharePost';

const inter = localFont({
  src: "../fonts/Inter-VariableFont_opsz,wght.ttf",
  variable: "--font-inter",
  weight: "100 900",
});

export default function FollowingFeed() {
  const [currentUser, setCurrentUser] = useState(null);
  const [followingList, setFollowingList] = useState([]);
  const { imageDimensions, handleImageLoad } = useImageDimensions();
  const handleShare = useSharePost();
  const { posts, loading, handleLike, handleDeletePost } = useChronologicalPosts({});
  const { following } = useFollow(currentUser, currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const db = getDatabase();
    const followingRef = ref(db, `follows/${currentUser.uid}/following`);

    const unsubscribe = onValue(followingRef, (snapshot) => {
      if (snapshot.exists()) {
        const followingData = Object.values(snapshot.val());
        setFollowingList(followingData.map(user => user.uid));
      } else {
        setFollowingList([]);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const filteredPosts = posts.filter(post => 
    followingList.includes(post.userId)
  ).sort((a, b) => b.createdAt - a.createdAt);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <div className={`${inter.variable} antialiased min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black`}>
      <LoadingOverlay isLoading={loading} />
      <div className="max-w-2xl mx-auto px-4">
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Following Feed</h2>
            <span className="text-gray-400">Following: {following.length}</span>
          </div>

          {filteredPosts.length === 0 && !loading && (
            <div className="text-center text-gray-400 py-8">
              {currentUser ? "Follow some users to see their posts here!" : "Sign in to see posts from people you follow"}
            </div>
          )}

          <ul className="space-y-4">
            {filteredPosts.map((post) => (
              <li key={post.id} className="text-white p-4 bg-gradient-to-br from-purple-900/10 via-gray-800/20 to-blue-900/10 backdrop-blur-sm border border-white/10 rounded-2xl shadow-xl hover:from-purple-900/15 hover:via-gray-800/25 hover:to-blue-900/15 transition-all duration-300 ease-in-out relative overflow-hidden">
                <div className="flex space-x-2">
                  <Link href={`/profile/${post.userId}`} className="w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={post.profilePicture || '/default-avatar.png'}
                      alt={`${post.username || 'User'}'s profile`}
                      width={40}
                      height={40}
                      objectFit="cover"
                    />
                  </Link>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="font-bold">
                        <Link href={`/profile/${post.userId}`}>
                          {post.username || 'User'}
                        </Link>{' '}
                        <span className="text-gray-500">· {formatTimestamp(post.createdAt)}</span>
                      </div>
                      <PostDropdown
                        post={post}
                        currentUser={currentUser}
                        onDelete={handleDeletePost}
                      />
                    </div>

                    <Link href={`/posts/${post.id}`}>
                      <div className="cursor-pointer">
                        <div>{post.content}</div>
                        {post.imageUrl && (
                          <div className="mt-2 w-full h-auto overflow-hidden">
                            <Image
                              src={post.imageUrl}
                              alt="Post image"
                              loading="lazy"
                              width={imageDimensions[post.id]?.width || 500}
                              height={imageDimensions[post.id]?.height || 300}
                              onLoadingComplete={(result) => handleImageLoad(post.id, result)}
                              className="rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="flex items-center justify-between text-gray-300 mt-2">
                      <button
                        onClick={() => handleLike(post.id, post.likes || 0, post.likedBy || [], currentUser?.uid)}
                        className={`flex items-center space-x-1 cursor-pointer rounded-lg p-2 mr-2 ${
                          post.likedBy?.includes(currentUser?.uid)
                            ? 'text-purple-800 bg-purple-300 bg-opacity-50'
                            : 'bg-gray-700'
                        }`}
                        disabled={!currentUser}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24" className={post.likedBy?.includes(currentUser?.uid) ? 'fill-purple-800' : 'fill-gray-400'}>
                          <path d="M8.106 18.247C5.298 16.083 2 13.542 2 9.137C2 4.274 7.5.825 12 5.501l2 1.998a.75.75 0 0 0 1.06-1.06l-1.93-1.933C17.369 1.403 22 4.675 22 9.137c0 4.405-3.298 6.946-6.106 9.11q-.44.337-.856.664C14 19.729 13 20.5 12 20.5s-2-.77-3.038-1.59q-.417-.326-.856-.663" />
                        </svg>
                        <span>{post.likes || 0}</span>
                      </button>

                      <button
                        onClick={() => handleShare(post)}
                        className="flex items-center cursor-pointer bg-gray-700 fill-gray-400 active:bg-purple-300 active:bg-opacity-50 active:fill-purple-800 rounded-3xl p-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24">
                          <path d="M3.464 3.464C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12s0-7.071 1.464-8.536" opacity={0.5} />
                          <path fillRule="evenodd" d="M16.47 1.47a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06l3.72-3.72H14c-1.552 0-2.467.757-2.788 1.08l-.19.191l-.193.191c-.322.32-1.079 1.236-1.079 2.788v3a.75.75 0 0 1-1.5 0v-3c0-2.084 1.027-3.36 1.521-3.851l.19-.189l.188-.189C10.64 7.277 11.916 6.25 14 6.25h6.19l-3.72-3.72a.75.75 0 0 1 0-1.06" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}