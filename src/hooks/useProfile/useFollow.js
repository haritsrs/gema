import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, get, update, remove } from 'firebase/database';
import { useNotifications } from '../useNotifications';

export const unFollow = async (currentUser, profileUser, database, setIsFollowing) => {
  if (!currentUser || !profileUser) return;
  
  const followRef = ref(database, `follows/${currentUser.uid}/following/${profileUser.uid}`);
  const followerRef = ref(database, `follows/${profileUser.uid}/followers/${currentUser.uid}`);
  
  try {
    await remove(followRef);
    await remove(followerRef);
    if (setIsFollowing) {
      setIsFollowing(false);
    }
  } catch (error) {
    console.error("Error unfollowing:", error);
    throw error;
  }
};

export function useFollow(currentUser, profileUser) {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const {addNotification} = useNotifications();
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
        await unFollow(currentUser, profileUser, database, setIsFollowing);
      } else {
        // Following data submission
        await update(followRef, {
          uid: profileUser.uid,
          displayName: profileUser.displayName || '',
          photoURL: profileUser.profilePicture || '',
          userName : profileUser.username || profileUser.email?.split('@')[0], // Nanti 'else' conditionnya ilangin aja kalo udah implement sistem username yang bener
        });
        // Follower data submission 
        await update(followerRef, {
          uid: currentUser.uid,
          displayName: currentUser.displayName || '',
          photoURL: currentUser.photoURL || '',
          userName : currentUser.username || currentUser.email?.split('@')[0], // Sama aowkwkwkwk
        });
        setIsFollowing(true);

        const notification = {
          type: 'follow',
          triggeredBy: {
            uid: currentUser.uid,
          },
          timestamp: Date.now(),
          message: `${currentUser.displayName || 'Someone'} followed you`,
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
    unFollow: () => unFollow(currentUser, profileUser, database, setIsFollowing),
  };
}
