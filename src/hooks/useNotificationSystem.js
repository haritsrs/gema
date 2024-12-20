"use client";

import { useState, useEffect } from 'react';
import { database } from '../../firebase'; // Adjust the path as needed
import { ref, onChildChanged, get } from 'firebase/database';

export function useNotificationSystem() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const postsRef = ref(database, 'posts');
    const followersRef = ref(database, 'follows');

    const unsubscribePosts = onChildChanged(postsRef, async (snapshot) => {
      const postId = snapshot.key;
      const postData = snapshot.val();
      const createdAt = new Date(postData.createdAt).toLocaleString();

      if (postData.likedBy) {
        const latestLikeUserId = postData.likedBy[postData.likedBy.length - 1];
        const userRef = ref(database, `users/${latestLikeUserId}`);
        const userSnapshot = await get(userRef);
        if (userSnapshot.exists()) {
          const displayName = userSnapshot.val().displayName;
          setNotifications((prev) => [
            ...prev,
            `${displayName} liked your post at ${createdAt}`,
          ]);
        }
      }

      if (postData.comments) {
        const latestCommentKey = Object.keys(postData.comments).pop();
        const latestComment = postData.comments[latestCommentKey];
        const { username: displayName, content: comment } = latestComment;
        setNotifications((prev) => [
          ...prev,
          `${displayName} commented on your post: "${comment}" at ${createdAt}`,
        ]);
      }
    });

    const unsubscribeFollowers = onChildChanged(followersRef, async (snapshot) => {
      const userId = snapshot.key;
      const followersData = snapshot.val()?.followers;

      if (followersData) {
        const latestFollowerKey = Object.keys(followersData).pop();
        const latestFollower = followersData[latestFollowerKey];

        const { displayName } = latestFollower;
        setNotifications((prev) => [
          ...prev,
          `${displayName} started following you.`,
        ]);
      }
    });

    return () => {
      unsubscribePosts();
      unsubscribeFollowers();
    };
  }, []);

  return { notifications };
}

