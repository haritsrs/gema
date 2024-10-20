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
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../../firebase";
import Link from "next/link";

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
        createdAt: new Date(), // Ensure the createdAt is set here
      });
      setNewComment(""); // Reset comment input after submission
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown";
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
        url: `${window.location.origin}/posts/${postId}`,
      })
      .then(() => console.log('Post shared successfully'))
      .catch((error) => console.error('Error sharing the post:', error));
    } else {
      copyToClipboard(postId);
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
  
  // Fetch post data and comments
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

  // Use onSnapshot to listen for changes in comments
  useEffect(() => {
    if (postId) {
      const commentsRef = collection(db, "posts", postId, "comments");
      const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
        const commentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(commentsData); // Set comments data
      });
      return () => unsubscribe(); // Clean up the listener on component unmount
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
            {post.imageUrl && (
              <img 
                src={post.imageUrl} 
                alt="Post image" 
                className="mt-2 w-full h-auto rounded-lg" 
              /> 
            )}
            <div>{post.content}</div>
          </div>
        </div>
        <div className="flex items-center justify-center text-gray-500 mt-2">
          <button
            className={`flex space-x-1 cursor-pointer rounded-lg drop-shadow-md active:filter-none p-2 mr-2 w-full items-center justify-center ${post.likedBy?.includes(currentUser?.uid) ? 'text-purple-800 bg-purple-300 bg-opacity-50 fill-purple-800' : 'bg-gray-700 fill-gray-500'}`}
            onClick={() => handleLike(postId, post.likes, post.likedBy || [])}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24">
              <path d="M8.106 18.247C5.298 16.083 2 13.542 2 9.137C2 4.274 7.5.825 12 5.501l2 1.998a.75.75 0 0 0 1.06-1.06l-1.93-1.933C17.369 1.403 22 4.675 22 9.137c0 4.405-3.298 6.946-6.106 9.11q-.44.337-.856.664C14 19.729 13 20.5 12 20.5s-2-.77-3.038-1.59q-.417-.326-.856-.663"></path>
            </svg>
            <span>{post.likes || 0}</span>
          </button>

          <button 
            className="flex cursor-pointer bg-gray-700 fill-gray-400 active:bg-purple-300 active:bg-opacity-50 active:fill-purple-800 active:text-purple-800 rounded-lg drop-shadow-md p-2 mr-2 w-full space-x-1 items-center justify-center" 
            onClick={() => sharePost(post)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12 6.627 0 12-5.373 12-12S18.627 0 12 0zm-2 17.536V14h-2v-2h2v-2l3 3-3 3zm8-5h-2V5h2v7.536z"></path>
            </svg>
            <span>Share</span>
          </button>
        </div>

        {/* Comments Section */}
<div className="mt-4">
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
        className="flex-grow bg-gray-800 rounded-lg p-2"
        placeholder="Add a comment..."
      />
      <button type="submit" className="ml-2 bg-purple-600 text-white rounded-lg p-2">Post</button>
    </form>
  )}
</div>

      </div>
    </div>
  );
}
