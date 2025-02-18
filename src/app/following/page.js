"use client";

import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useAuth } from "../../hooks/useAuth";
import localFont from "next/font/local";
import Link from 'next/link';
import Image from 'next/legacy/image';
import LoadingOverlay from '../../components/LoadingOverlay';
import { useChronologicalPosts } from '../../hooks/usePostSorting/useChronologicalPosts';
import { useFollow } from '../../hooks/useProfile/useFollow';
import PostDropdown from '../../components/PostDropdown';
import { useImageDimensions } from '../../hooks/useImageDimensions';
import { useSharePost } from '../../hooks/useSharePost';
import { usePostSystem } from '../../hooks/usePostSystem';
import { Users } from 'lucide-react';
import Head from 'next/head';

const inter = localFont({
  src: "../fonts/Inter-VariableFont_opsz,wght.ttf",
  variable: "--font-inter",
  weight: "100 900",
});

export default function FollowingFeed() {
  const [showTooltip, setShowTooltip] = useState(false);
  const { user:currentUser } = useAuth();
  const [followingList, setFollowingList] = useState([]);
  const { imageDimensions, handleImageLoad } = useImageDimensions();
  const handleShare = useSharePost();
  const { posts, loading, handleLike, handleDeletePost } = useChronologicalPosts({});
  const { following } = useFollow(currentUser, currentUser);
  const { formatTimestamp } = usePostSystem();

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

  return (
    <div className={`${inter.variable} antialiased min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black`}>
      <Head>
        <title>GEMA</title>
      </Head>
      <LoadingOverlay isLoading={loading} />
      <div className="max-w-2xl mx-auto px-4">
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Following Feed</h2>
            <div className="relative">
              <div 
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/20 backdrop-blur-sm hover:bg-purple-500/20 transition-all duration-200 cursor-help"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Users size={16} className="text-purple-400" />
                <span className="text-purple-300 font-medium">{following.length}</span>
              </div>
              {showTooltip && (
            <div
              className="absolute z-10 top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 
                        bg-purple-900/80 text-purple-200 text-sm rounded-lg backdrop-blur-md 
                        shadow-md whitespace-nowrap transition-transform duration-200 
                        transform scale-95 opacity-80"
            >
              Following
            </div>
          )}

            </div>
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
                  <div className="flex mx-2">
                    <button
                      onClick={() => handleLike(post, post.likes, post.likedBy || [], currentUser.uid)}
                      disabled={!currentUser}
                      className={`flex items-center space-x-1 cursor-pointer rounded-lg drop-shadow-md active:filter-none p-2 mr-2 justify-center ${post.likedBy?.includes(currentUser?.uid)
                        ? 'text-purple-800 bg-purple-300 bg-opacity-50 fill-purple-800'
                        : 'bg-gray-700 fill-gray-500'
                        }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24">
                        <path d="M8.106 18.247C5.298 16.083 2 13.542 2 9.137C2 4.274 7.5.825 12 5.501l2 1.998a.75.75 0 0 0 1.06-1.06l-1.93-1.933C17.369 1.403 22 4.675 22 9.137c0 4.405-3.298 6.946-6.106 9.11q-.44.337-.856.664C14 19.729 13 20.5 12 20.5s-2-.77-3.038-1.59q-.417-.326-.856-.663" />
                      </svg>
                      <span>{post.likes || 0}</span>
                    </button>
                    <button
                      className="flex items-center space-x-1 bg-gray-700 fill-gray-400 active:bg-purple-300 active:bg-opacity-50 active:fill-purple-800 active:text-purple-800 rounded-lg drop-shadow-md active:filter-none p-2"
                      onClick={() => {
                        window.location.href = `/posts/${post.id}`;
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24">
                        <path d="m13.629 20.472l-.542.916c-.483.816-1.69.816-2.174 0l-.542-.916c-.42-.71-.63-1.066-.968-1.262c-.338-.197-.763-.204-1.613-.219c-1.256-.021-2.043-.098-2.703-.372a5 5 0 0 1-2.706-2.706C2 14.995 2 13.83 2 11.5v-1c0-3.273 0-4.91.737-6.112a5 5 0 0 1 1.65-1.651C5.59 2 7.228 2 10.5 2h3c3.273 0 4.91 0 6.113.737a5 5 0 0 1 1.65 1.65C22 5.59 22 7.228 22 10.5v1c0 2.33 0 3.495-.38 4.413a5 5 0 0 1-2.707 2.706c-.66.274-1.447.35-2.703.372c-.85.015-1.275.022-1.613.219c-.338.196-.548.551-.968 1.262" opacity={0.5} />
                        <path d="M17 11a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-4 0a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-4 0a1 1 0 1 1-2 0a1 1 0 0 1 2 0" />
                      </svg>
                      <span>{post.comment || 0}</span>
                    </button>
                  </div>

                  <button
                    className="flex items-center cursor-pointer bg-gray-700 fill-gray-400 active:bg-purple-300 active:bg-opacity-50 active:fill-purple-800 rounded-3xl drop-shadow-lg p-2 mr-2"
                    onClick={() => handleShare(post)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24">
                      <path d="M3.464 3.464C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12s0-7.071 1.464-8.536" opacity={0.5} />
                      <path fillRule="evenodd" d="M16.47 1.47a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06l3.72-3.72H14c-1.552 0-2.467.757-2.788 1.08l-.19.191l-.193.191c-.322.32-1.079 1.236-1.079 2.788v3a.75.75 0 0 1-1.5 0v-3c0-2.084 1.027-3.36 1.521-3.851l.19-.189l.188-.189C10.64 7.277 11.916 6.25 14 6.25h6.19l-3.72-3.72a.75.75 0 0 1 0-1.06" clipRule="evenodd" />
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