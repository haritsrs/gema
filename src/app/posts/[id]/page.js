"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  collection,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth"; // Import auth listener
import { auth } from "../../../../firebase"; // Ensure your firebase.js exports auth
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart} from "@fortawesome/free-solid-svg-icons";

export default function PostPage() {
  const router = useRouter();
  const [postId, setPostId] = useState(null);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // Listen for authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // Set the logged-in user
    });
    return () => unsubscribe(); // Clean up the listener on component unmount
  }, []);

  // Handle Like Button Click
  const handleLike = async (postId, currentLikes, likedBy = []) => {
    if (!currentUser) return; // Ensure user is logged in

    const postRef = doc(db, "posts", postId);
    const hasLiked = likedBy.includes(currentUser.uid);

    try {
      if (hasLiked) {
        await updateDoc(postRef, {
          likes: currentLikes - 1,
          likedBy: arrayRemove(currentUser.uid),
        });
      } else {
        await updateDoc(postRef, {
          likes: currentLikes + 1,
          likedBy: arrayUnion(currentUser.uid),
        });
      }

      // Update the post state locally to reflect like/unlike
      setPost((prevPost) => ({
        ...prevPost,
        likes: hasLiked ? currentLikes - 1 : currentLikes + 1,
        likedBy: hasLiked
          ? prevPost.likedBy.filter((uid) => uid !== currentUser.uid)
          : [...prevPost.likedBy, currentUser.uid],
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
      const commentRef = collection(db, "posts", postId, "comments");
      await addDoc(commentRef, {
        userId: currentUser.uid,
        username: currentUser.displayName || "Anonymous",
        content: newComment,
        createdAt: new Date(),
      });
      setComments((prevComments) => [
        ...prevComments,
        {
          userId: currentUser.uid,
          username: currentUser.displayName || "Anonymous",
          content: newComment,
          createdAt: new Date(),
        },
      ]);
      setNewComment(""); // Reset comment input after submission
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return "Unknown";
    const now = new Date();
    const secondsAgo = Math.floor((now - timestamp.toDate()) / 1000);

    if (secondsAgo < 60) return `${secondsAgo}s ago`;
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
    return `${Math.floor(secondsAgo / 86400)}d ago`;
  };
  
  // Share post methods
  const sharePost = (post) => {
    if (navigator.share) {
      navigator.share({
        title: post.title || "Check out this post!",
        text: post.content || "Take a look at this post on our platform!",
        url: `${window.location.origin}/posts/${post.id}`,
      })
      .then(() => console.log('Post shared successfully'))
      .catch((error) => console.error('Error sharing the post:', error));
    } else {
      copyToClipboard(post);
    }
  };
  // if Web Share API not supported
  const copyToClipboard = (postId) => {
    const postUrl = `${window.location.origin}/posts/${postId}`;
    
    navigator.clipboard.writeText(postUrl)
      .then(() => {
        alert('Post URL copied to clipboard!');
      })
      .catch(() => {
        alert('Failed to copy URL.');
      });
  };
  
  // Fetch post data
  useEffect(() => {
    const currentPath = window.location.pathname;
    const id = currentPath.split("/posts/")[1];
    if (id) {
      setPostId(id);
    }
  }, []);

  useEffect(() => {
    if (postId) {
      const fetchPost = async () => {
        try {
          const postRef = doc(db, "posts", postId);
          const postSnap = await getDoc(postRef);
          if (postSnap.exists()) {
            setPost(postSnap.data());
          } else {
            console.error("No such document!");
          }
        } catch (error) {
          console.error("Error fetching post:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [postId]);

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="flex-col md:flex grow w-full text-white p-4 items-center justify-center">
      <div className="w-full max-w-xl bg-gray-800 p-6 rounded-lg">
        {/* Post Display */}
        <div className="flex space-x-2">
          <img
            src={post.profilePicture || "https://placehold.co/40x40"}
            alt={`${post.username || "User"}'s profile`}
            className="rounded-full"
            style={{ width: "40px", height: "40px" }}
          />
          <div>
            <div className="font-bold">
              {post.username || "User"}{" "}
              <span className="text-gray-500">· {formatTimestamp(post.createdAt)}</span>
            </div>
            <div>{post.content}</div>
          </div>
        </div>
        <div className="flex items-center justify-center text-gray-500 mt-2">
          <button className={`flex space-x-1 cursor-pointer rounded-lg drop-shadow-md active:filter-none p-2 mr-2 w-40 items-center justify-center ${post.likedBy?.includes(currentUser?.uid) ? 'text-purple-800 bg-purple-300 bg-opacity-50 fill-purple-800' : 'bg-gray-700 fill-gray-500'}`} onClick={() => handleLike(postId, post.likes, post.likedBy || [])}>
            <svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24">
              <path d="M8.106 18.247C5.298 16.083 2 13.542 2 9.137C2 4.274 7.5.825 12 5.501l2 1.998a.75.75 0 0 0 1.06-1.06l-1.93-1.933C17.369 1.403 22 4.675 22 9.137c0 4.405-3.298 6.946-6.106 9.11q-.44.337-.856.664C14 19.729 13 20.5 12 20.5s-2-.77-3.038-1.59q-.417-.326-.856-.663">
              </path>
            </svg>
            <span>{post.likes || 0}</span>
          </button>

          <button className="flex cursor-pointer bg-gray-700 fill-gray-400 active:bg-purple-300 active:bg-opacity-50 active:fill-purple-800 active:text-purple-800 rounded-lg drop-shadow-md p-2 mr-2 w-40 space-x-1 items-center justify-center" onClick={() => sharePost(post)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24">
              <path d="M3.464 3.464C4.93 2 7.286 2 12 2s7.071 0 8.535 1.464C22 4.93 22 7.286 22 12s0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12s0-7.071 1.464-8.536" opacity={0.5}>
              </path>
              <path fillRule="evenodd" d="M16.47 1.47a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06l3.72-3.72H14c-1.552 0-2.467.757-2.788 1.08l-.19.191l-.193.191c-.322.32-1.079 1.236-1.079 2.788v3a.75.75 0 0 1-1.5 0v-3c0-2.084 1.027-3.36 1.521-3.851l.19-.189l.188-.189C10.64 7.277 11.916 6.25 14 6.25h6.19l-3.72-3.72a.75.75 0 0 1 0-1.06" clipRule="evenodd">
              </path>
            </svg>
            <span>Share</span>
        </button>
        </div>

        {/* Comments Section */}
        <div className="mt-4">
          <h3 className="text-xl">Comments</h3>
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <div key={index} className="mt-2 p-2 bg-gray-700 rounded-lg">
                <div className="font-bold">{comment.username}</div>
                <div>{comment.content}</div>
                <div className="text-gray-500 text-sm">
                  {formatTimestamp(comment.createdAt)}
                </div>
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}

          {/* Comment Input */}
          <form onSubmit={handleCommentSubmit} className="mt-4 flex drop-shadow-md">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment"
              className="flex-1 p-2 bg-gray-700 text-white rounded-l-lg"
            />
            <button
              type="submit"
              className="bg-purple-800 active:bg-purple-500 p-2 rounded-r-lg text-white"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
