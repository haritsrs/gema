import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, get, update, remove } from 'firebase/database';
import { useNotifications } from '../useNotifications';

export function useFollow(currentUser, profileUser) {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const { addNotification } = useNotifications();
  const database = getDatabase();

  // Fetch followers and following data
  useEffect(() => {
    if (!profileUser) return;

    const followersRef = ref(database, `follows/${profileUser.uid}/followers`);
    const followingRef = ref(database, `follows/${profileUser.uid}/following`);

    const fetchFollowers = onValue(followersRef, (snapshot) => {
      setFollowers(snapshot.exists() ? Object.values(snapshot.val()) : []);
    });

    const fetchFollowing = onValue(followingRef, (snapshot) => {
      setFollowing(snapshot.exists() ? Object.values(snapshot.val()) : []);
    });

    if (currentUser) {
      const isFollowingRef = ref(database, `follows/${currentUser.uid}/following/${profileUser.uid}`);
      get(isFollowingRef).then((snapshot) => setIsFollowing(snapshot.exists()));
    }

    return () => {
      fetchFollowers();
      fetchFollowing();
    };
  }, [profileUser, currentUser, database]);

  // Handle follow/unfollow actions
  const toggleFollow = async () => {
    if (!currentUser || !profileUser) return;

    const followRef = ref(database, `follows/${currentUser.uid}/following/${profileUser.uid}`);
    const followerRef = ref(database, `follows/${profileUser.uid}/followers/${currentUser.uid}`);

    try {
      if (isFollowing) {
        // Unfollow
        await remove(followRef);
        await remove(followerRef);
        setIsFollowing(false);
      } else {
        // Follow
        await update(followRef, {
          uid: profileUser.uid,
          displayName: profileUser.displayName || '',
          photoURL: profileUser.photoURL || '',
        });
        await update(followerRef, {
          uid: currentUser.uid,
          displayName: currentUser.displayName || '',
          photoURL: currentUser.photoURL || '',
        });
        setIsFollowing(true);

        const notification = {
          type: 'follow',
          triggeredBy: {
            uid: currentUser.uid,
          },
          timestamp: Date.now(),
          message: `${currentUser.displayName || 'Unknown User'} followed you`,
        };
        addNotification(profileUser.uid, notification);
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
    }
  };

  return {
    followers,
    following,
    isFollowing,
    toggleFollow,
  };
}
