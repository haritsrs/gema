"use client";

import { useState, useEffect, useCallback } from 'react';
import { getStorage } from 'firebase/storage';
import { getDatabase, ref, query, orderByChild, onValue, get, update, remove } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../../firebase.js';
import localFont from "next/font/local";
import Posting from '../../../components/posting';
import LoadingOverlay from '../../../components/LoadingOverlay';
import Link from 'next/link';
import Image from 'next/image';
import PostDropdown from '../../../components/PostDropdown';
import { usePostSystem } from '../../../hooks/usePostSystem';
import { useImageDimensions } from '../../../hooks/useImageDimensions.js';
import { useSharePost } from "../../../hooks/useSharePost";
import { useParams } from 'next/navigation';
import { useFollow } from '../../../hooks/useProfile/useFollow'
import { useChronologicalPosts } from '../../../hooks/usePostSorting/useChronologicalPosts'
import FollowModal from '../../../components/FollowModal.js';


const inter = localFont({
  src: "../../fonts/Inter-VariableFont_opsz,wght.ttf",
  variable: "--font-inter",
  weight: "100 900",
});

export default function IDProfilePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { imageDimensions, handleImageLoad } = useImageDimensions();
  const params = useParams();
  const handleShare = useSharePost();
  const { formatTimestamp } = usePostSystem();
  const id = params.id; // Get the user ID from the URL
  const storage = getStorage();
  const database = getDatabase();
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  const {
    followers,
    following,
    isFollowing,
    toggleFollow,
  } = useFollow(currentUser, profileUser);

  const {
    posts,
    loading: postsLoading,
    handleLike,
    handleDeletePost,
    setPosts
  } = useChronologicalPosts({ id });

  // Authentication listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch profile user details
  useEffect(() => {
    const fetchProfileUser = async () => {
      if (!id) return;

      try {
        const userRef = ref(database, `users/${id}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          setProfileUser({
            uid: id,
            ...snapshot.val()
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile user:", error);
        setLoading(false);
      }
    };

    fetchProfileUser();
  }, [id, database]);

  // Fetch user posts based on the provided id
  useEffect(() => {
    if (posts && id) {
      const filtered = posts.filter(post => post.userId === id);
      setUserPosts(filtered);
    }
  }, [posts, id]);

  const handlePostCreated = useCallback((newPost) => {
    const enhancedPost = {
      ...newPost,
      id: newPost.id || Date.now().toString(),
      profilePicture: currentUser?.photoURL || '/img/error.png',
      username: currentUser?.displayName || 'User',
      likes: 0,
      likedBy: [],
    };

    setPosts(prevPosts => [enhancedPost, ...prevPosts]);
  }, [currentUser, setPosts, database]);

  // Loading state
  if (loading || postsLoading) {
    return <LoadingOverlay isLoading={true} />;
  }

  // No profile found
  if (!profileUser) {
    return (
      <div className="h-full w-full bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-xl font-bold mb-4">User profile not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`${inter.variable}  antialiased min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black`}>
      {/* Profile Header */}
      <div className="w-full h-80 bg-gradient-to-r from-purple-600 to-blue-600 pt-16 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center w-full space-y-2">
            {/* Profile Image and Name */}
            <div className="overflow-hidden">
              <Image
                src={profileUser.profilePicture || '/img/error.png'}
                alt="User profile"
                width={100}
                height={100}
                className="rounded-full image"
              />

            </div>

            <div className="mt-4 text-center">
              <h1 className="text-2xl font-bold text-white">{profileUser.displayName || 'User'}</h1>
              <p className="text-gray-300">@{profileUser.email?.split('@')[0]}</p>
            </div>

            {/* Follow/Edit Profile Button */}
            {currentUser && currentUser.uid !== profileUser.uid && (
              <button
                onClick={toggleFollow}
                className={`px-4 py-2 rounded-xl ${isFollowing
                  ? 'bg-gray-700 text-white'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}

            {currentUser && currentUser.uid === profileUser.uid && (
              <Link
                href="/settings/edit-profile"
                className="absolute right bottom bg-purple-100 hover:bg-purple-700 text-bold text-purple-700 hover:text-white px-4 py-2 rounded-xl flex items-center space-x-2 relative"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                </svg>
                <span>Edit Profile</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-2xl mx-auto px-4 mt-8">
        {/* User Stats */}
        <div className="mb-6">
          <div className="
            bg-gradient-to-br 
            from-gray-900/40 
            to-gray-800/40 
            backdrop-blur-xl 
            border 
            border-white/10 
            rounded-3xl 
            shadow-2xl 
            p-6
            relative"
          >
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="col-span-1 flex flex-col items-start">
                <div className="text-sm font-medium text-white mb-1">
                  Likes
                </div>
                <div className="text-2xl text-white">
                  {userPosts.reduce((acc, post) => acc + (post?.likes ?? 0), 0)}
                </div>
              </div>

              <div className="col-span-1 flex flex-col items-center">
                <div className="text-sm font-medium text-white mb-1">
                  Posts
                </div>
                <div className="text-2xl text-white">
                  {userPosts.length}
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => setShowFollowersModal(true)}
                  className="flex items-center space-x-2 hover:bg-gray-800 rounded-lg p-2 transition-colors"
                >
                  <div className="text-sm font-medium text-white">
                    Followers
                  </div>
                  <div className="text-xl text-white">
                    {followers.length}
                  </div>
                </button>
                <button
                  onClick={() => setShowFollowingModal(true)}
                  className="flex items-center space-x-2 hover:bg-gray-800 rounded-lg p-2 transition-colors"
                >
                  <div className="text-sm font-medium text-white">
                    Following
                  </div>
                  <div className="text-xl text-white">
                    {following.length}
                  </div>
                </button>
              </div>

              {/* Vertical separators */}
              <div className="absolute top-1/2 left-1/3 w-px h-1/2 bg-white/10 transform -translate-y-1/2"></div>
              <div className="absolute top-1/2 right-1/3 w-px h-1/2 bg-white/10 transform -translate-y-1/2"></div>
            </div>
          </div>
        </div>

        {/* Posting Component (only show if viewing own profile and logged in) */}
        {currentUser && currentUser.uid === profileUser.uid && (
          <div className="mb-6">
            <Posting onPostCreated={handlePostCreated} storage={storage} />
          </div>
        )}

        {/* User Posts */}
        <h2 className="text-xl font-bold text-white mb-4">{profileUser.displayName || 'User'}&apos;s Posts</h2>
        {userPosts.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            This user hasn&apos;t made any posts yet.
          </div>
        ) : (
          <ul className="space-y-4">
            {userPosts.map((post) => (
              <li key={post.id || `post-${Date.now()}-${Math.random()}`} className="text-white p-4 
              bg-gradient-to-br 
              from-purple-900/10 
              via-gray-800/20 
              to-blue-900/10 
              backdrop-blur-sm 
              border border-white/10 
              rounded-2xl 
              shadow-xl 
              hover:from-purple-900/15 
              hover:via-gray-800/25 
              hover:to-blue-900/15 
              transition-all 
              duration-300 
              ease-in-out 
              relative 
              overflow-hidden"
              >
                <div className="flex space-x-2">
                  <div className="rounded-full w-10 h-10 overflow-hidden">
                    <Image
                      src={post.profilePicture || '/img/error.png'}
                      alt={`${post.username || 'User'}'s profile`}
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="font-bold">
                        {post.username || profileUser.displayName || 'User'}
                        <span className="text-gray-500"> · {formatTimestamp(post.createdAt)}</span>
                      </div>
                      {/* PostDropdown only visible to the post owner when logged in */}
                      {currentUser && (
                        <PostDropdown
                          post={post}
                          currentUser={currentUser}
                          onDelete={handleDeletePost}
                        />
                      )}
                    </div>
                    <Link href={`/posts/${post.id}`}>
                      <div>{post.content}</div>
                      {post.imageUrl && (
                        <div className="mt-2 w-full h-auto rounded-lg overflow-hidden">
                          <Image
                            src={post.imageUrl}
                            alt="Post image"
                            loading="lazy"
                            width={imageDimensions[post.id]?.width || 500}
                            height={imageDimensions[post.id]?.height || 300}
                            onLoad={(result) => handleImageLoad(post.id, result)}
                            className="rounded-lg"
                          />
                        </div>
                      )}
                    </Link>
                  </div>
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between text-gray-300 mt-2">
                  <div className="flex mx-2">
                    <button
                      onClick={() => handleLike(post.id, post.likes || 0, post.likedBy || [], currentUser?.uid)}
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
                      <span>Comment</span>
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
              </li>
            ))}
          </ul>
        )}
        <FollowModal
          isOpen={showFollowersModal}
          onClose={() => setShowFollowersModal(false)}
          title="Followers"
          users={followers}
        />
        <FollowModal
          isOpen={showFollowingModal}
          onClose={() => setShowFollowingModal(false)}
          title="Following"
          users={following}
        />
      </div>
    </div>
  );
}
