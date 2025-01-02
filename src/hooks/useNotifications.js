import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, push, update, remove, orderByChild, limitToFirst, query, get } from 'firebase/database';

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const database = getDatabase();

  useEffect(() => {
    if (!userId) return;

    const notificationsRef = ref(database, `notifications/${userId}`);

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const notificationsData = [];
      snapshot.forEach((childSnapshot) => {
        notificationsData.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      setNotifications(notificationsData);
    });

    return () => unsubscribe();
  }, [userId, database]);

  // Function to trim notifications to maintain a maximum of 30
  const trimNotifications = async (userId) => {
    const notificationsRef = ref(database, `notifications/${userId}`);
    const notificationsQuery = query(notificationsRef, orderByChild('timestamp'), limitToFirst(5));

    const snapshot = await get(notificationsQuery);
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        remove(ref(database, `notifications/${userId}/${childSnapshot.key}`));
      });
    }
  };

  // Function to add a notification
  const addNotification = async (userId, notification) => {
    const notificationsRef = ref(database, `notifications/${userId}`);
    const newNotificationRef = push(notificationsRef);
    await update(newNotificationRef, notification);

    // Check and trim notifications if necessary
    const snapshot = await get(notificationsRef);
    if (snapshot.exists() && snapshot.size > 30) {
      await trimNotifications(userId);
    }
  };

  // Function to clear notifications
  const clearNotifications = async (userId) => {
    const notificationsRef = ref(database, `notifications/${userId}`);
    await remove(notificationsRef);
  };

  return {
    notifications,
    addNotification,
    clearNotifications,
  };
}