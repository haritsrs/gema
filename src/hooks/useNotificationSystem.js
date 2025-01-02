"use client";

import { useState, useEffect } from "react";
import { database } from "../../firebase";
import { ref, onChildChanged, get, set, remove } from "firebase/database";

export function useNotificationSystem(currentUserId) {
  const [notifications, setNotifications] = useState([]);
  const notificationsRef = ref(database, `users/${currentUserId}/notifications`);

  useEffect(() => {
    if (!currentUserId) return;

    const postsRef = ref(database, "posts");
    const followersRef = ref(database, `follows/${currentUserId}/followers`);

    // Listen for changes to posts
    const unsubscribePosts = onChildChanged(postsRef, async (snapshot) => {
      const postId = snapshot.key;
      const postData = snapshot.val();

      if (!postData) return;

      const createdAt = new Date(postData.createdAt).toLocaleString();

      // Handle likes
      if (postData.likedBy) {
        const likedBy = Object.keys(postData.likedBy);
        const latestLikeUserId = likedBy[likedBy.length - 1];
        const userRef = ref(database, `users/${latestLikeUserId}`);
        const userSnapshot = await get(userRef);
        if (userSnapshot.exists()) {
          const { displayName } = userSnapshot.val();
          const notification = {
            type: "like",
            content: `${displayName} liked your post`,
            postId,
            timestamp: Date.now(),
          };
          await addNotification(notification);
        }
      }

      // Handle comments
      if (postData.comments) {
        const commentKeys = Object.keys(postData.comments);
        const latestCommentKey = commentKeys[commentKeys.length - 1];
        const latestComment = postData.comments[latestCommentKey];
        const { username, content } = latestComment;

        const notification = {
          type: "comment",
          content: `${username} commented on your post: "${content}"`,
          postId,
          timestamp: Date.now(),
        };
        await addNotification(notification);
      }
    });

    // Listen for changes to followers
    const unsubscribeFollowers = onChildChanged(followersRef, async (snapshot) => {
      const latestFollowerKey = snapshot.key;
      const userRef = ref(database, `users/${latestFollowerKey}`);
      const userSnapshot = await get(userRef);
      if (userSnapshot.exists()) {
        const { displayName } = userSnapshot.val();
        const notification = {
          type: "follow",
          content: `${displayName} started following you`,
          timestamp: Date.now(),
        };
        await addNotification(notification);
      }
    });

    return () => {
      unsubscribePosts();
      unsubscribeFollowers();
    };
  }, [currentUserId]);

  // Add a notification to the database
  const addNotification = async (notification) => {
    try {
      const newNotificationRef = ref(
        database,
        `users/${currentUserId}/notifications/${Date.now()}`
      );
      await set(newNotificationRef, notification);

      // Clean up if notifications exceed 25
      const snapshot = await get(notificationsRef);
      if (snapshot.exists() && Object.keys(snapshot.val()).length > 25) {
        const oldestNotificationKey = Object.keys(snapshot.val())[0];
        const oldestNotificationRef = ref(
          database,
          `users/${currentUserId}/notifications/${oldestNotificationKey}`
        );
        await remove(oldestNotificationRef);
      }
    } catch (error) {
      console.error("Failed to add notification:", error);
    }
  };

  // Fetch notifications
  useEffect(() => {
    if (!currentUserId) return;

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        setNotifications(
          Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }))
        );
      } else {
        setNotifications([]);
      }
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // Clear all notifications
  const clearNotifications = async () => {
    try {
      await remove(notificationsRef);
      setNotifications([]);
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  return { notifications, clearNotifications };
}
