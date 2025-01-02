"use client";

import { useEffect, useState } from "react";
import { database } from "../../../../firebase";
import { ref, set, push, onValue, off } from "firebase/database";
import { useAuth } from "../../../hooks/useAuth";
import Image from "next/legacy/image";
import { useImageDimensions } from '../../../hooks/useImageDimensions'
import { usePostSystem } from "../../../hooks/usePostSystem";

export default function PostPage() {
  const [postId, setPostId] = useState(null);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const { imageDimensions, handleImageLoad } = useImageDimensions();
  const { formatTimestamp } = usePostSystem();
  const { user:currentUser } = useAuth();

  // Handle Like Button Click
  const handleLike = async (postId, currentLikes, likedBy = []) => {
    if (!currentUser) return;

    const hasLiked = likedBy.includes(currentUser.uid);

    try {
      const updatedLikedBy = hasLiked
        ? likedBy.filter(uid => uid !== currentUser.uid)
        : [...likedBy, currentUser.uid];

      await set(ref(database, `posts/${postId}/likes`), hasLiked ? (currentLikes - 1) : (currentLikes + 1));
      await set(ref(database, `posts/${postId}/likedBy`), updatedLikedBy);

      // Update the post state locally
      setPost(prevPost => ({
        ...prevPost,
        likes: hasLiked ? currentLikes - 1 : currentLikes + 1,
        likedBy: updatedLikedBy,
      }));
    } catch (error) {
      console.error("Error updating likes: ", error);
    }
  };

  // Handle New Comment Submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const commentsRef = ref(database, `posts/${postId}/comments`);
      const newCommentRef = push(commentsRef);

      await set(newCommentRef, {
        userId: currentUser.uid,
        username: currentUser.displayName || "Anonymous",
        content: newComment,
        createdAt: new Date().toISOString(),
      });

      setNewComment("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  // Share post methods
  const sharePost = (post) => {
    if (navigator.share) {
      navigator.share({
        title: post.title || "Check this out!",
        text: post.content || "Take a look at this post on GEMA,",
        url: `${window.location.origin}/posts/${postId}`,
      })
        .then(() => console.log('Post shared successfully'))
        .catch((error) => console.error('Error sharing the post:', error));
    } else {
      copyToClipboard(postId);
    }
  };

  const copyToClipboard = (postId) => {
    const postUrl = `${window.location.origin}/posts/${postId}`;

    navigator.clipboard.writeText("Check this out! \nTake a look at this post on Gema, \n\n" + postUrl)
      .then(() => {
        alert('Post URL copied to clipboard!');
      })
      .catch(() => {
        alert('Failed to copy URL.');
      });
  };

  // Get postId from URL
  useEffect(() => {
    const currentPath = window.location.pathname;
    const id = currentPath.split("/posts/")[1];
    if (id) {
      setPostId(id);
    }
  }, []);

  // Fetch post data and listen for updates
  useEffect(() => {
    if (postId) {
      const postRef = ref(database, `posts/${postId}`);

      // Set up listener for post data
      onValue(postRef, (snapshot) => {
        if (snapshot.exists()) {
          const postData = snapshot.val();
          setPost(postData);
        } else {
          console.error("No such post!");
        }
        setLoading(false);
      });

      // Clean up listener
      return () => off(postRef);
    }
  }, [postId]);

  // Listen for comments updates
  useEffect(() => {
    if (postId) {
      const commentsRef = ref(database, `posts/${postId}/comments`);

      onValue(commentsRef, (snapshot) => {
        if (snapshot.exists()) {
          const commentsData = [];
          snapshot.forEach((childSnapshot) => {
            commentsData.push({
              id: childSnapshot.key,
              ...childSnapshot.val()
            });
          });
          setComments(commentsData);
        } else {
          setComments([]);
        }
      });

      return () => off(commentsRef);
    }
  }, [postId]);

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="flex w-full text-white p-4 items-center  justify-center">
      <div className="flex-col w-full max-w-xl bg-gray-800 p-5 rounded-xl">
        {/* Post Display */}
        <div className="flex justify-start space-x-2">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={post.profilePicture || '/default-avatar.png'}
              alt={`${post.username || 'User'}'s profile`}
              width={40}
              height={40}
              className="rounded-full"
              objectFit="cover"
            />
          </div>
          <div>
            <div className="font-bold">
              {post.username || "User"}{" "}
            </div>
            <span className="text-gray-500">
              {formatTimestamp(post.createdAt)}
            </span>
          </div>
        </div>

        {post.imageUrl && (
          <div className=" flex items-center justify-center my-2 w-full h-auto rounded-lg overflow-hidden">
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
        <div>{post.content}</div>

        <div className="flex items-center justify-center text-gray-500 mt-2 space-x-2">
          <button
            className={`flex space-x-1 cursor-pointer rounded-lg drop-shadow-md active:filter-none p-2 w-full items-center justify-center ${post.likedBy?.includes(currentUser?.uid) ? 'text-purple-800 bg-purple-300 bg-opacity-50 fill-purple-800' : currentUser ? 'bg-gray-700 fill-gray-500 text-gray-500' : 'bg-gray-400 fill-gray-100 text-gray-100'}`}
            onClick={() => handleLike(postId, post.likes, post.likedBy || [])}
            disabled={!currentUser}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24">
              <path d="M8.106 18.247C5.298 16.083 2 13.542 2 9.137C2 4.274 7.5.825 12 5.501l2 1.998a.75.75 0 0 0 1.06-1.06l-1.93-1.933C17.369 1.403 22 4.675 22 9.137c0 4.405-3.298 6.946-6.106 9.11q-.44.337-.856.664C14 19.729 13 20.5 12 20.5s-2-.77-3.038-1.59q-.417-.326-.856-.663"></path>
            </svg>
            <span>{post.likes || 0}</span>
          </button>

          <button
            className="flex cursor-pointer bg-gray-700 fill-gray-400 active:bg-purple-300 active:bg-opacity-50 active:fill-purple-800 active:text-purple-800 rounded-lg drop-shadow-md p-2 w-full space-x-1 items-center justify-center"
            onClick={() => sharePost(post)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24">
              <path d="M3.464 3.464C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12s0-7.071 1.464-8.536" opacity={0.5} />
              <path fillRule="evenodd" d="M16.47 1.47a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06l3.72-3.72H14c-1.552 0-2.467.757-2.788 1.08l-.19.191l-.193.191c-.322.32-1.079 1.236-1.079 2.788v3a.75.75 0 0 1-1.5 0v-3c0-2.084 1.027-3.36 1.521-3.851l.19-.189l.188-.189C10.64 7.277 11.916 6.25 14 6.25h6.19l-3.72-3.72a.75.75 0 0 1 0-1.06" clipRule="evenodd" />
            </svg>
            <span>Share</span>
          </button>
        </div>

        {/* Comments Section */}
        <div className="rounded-lg bg-gray-900 flex items-center justify-center mt-4 w-full h-max">
          <div className="flex flex-col m-4 w-[95%]">
            <h3 className="font-bold">Comments:</h3>
            <ul className="list-disc pl-5">
              {comments.map((comment) => (
                <li key={comment.id} className="mt-2">
                  <strong>{comment.username}: </strong>
                  <span>{comment.content}</span>
                  <span className="text-gray-500"> · {formatTimestamp(comment.createdAt)}</span>
                </li>
              ))}
            </ul>
            {/* New Comment Input */}
            {currentUser && (
              <form onSubmit={handleCommentSubmit} className="flex mt-4">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-grow bg-gray-700 rounded-lg p-2"
                  placeholder={`${currentUser ? 'Add a comment...' : 'Login to add a comment to this post...'}`}
                  disabled={!currentUser}
                />
                <button
                  type="submit"
                  className={`ml-2 text-white ${currentUser ? 'bg-gray-700 active:bg-purple-500 active:text-purple-900' : 'bg-gray-400 fill-gray-100'} rounded-lg p-2 drop-shadow-lg`}>
                  Post
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
