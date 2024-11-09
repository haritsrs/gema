import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';

export function useUserProfiles() {
  const [userProfiles, setUserProfiles] = useState({});
  const db = getDatabase();

  useEffect(() => {
    const usersRef = ref(db, 'users');
    
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const profiles = {};
        snapshot.forEach((childSnapshot) => {
          const userId = childSnapshot.key;
          const userData = childSnapshot.val();
          profiles[userId] = {
            profilePicture: userData.profilePicture || '/default-avatar.png',
            username: userData.username || 'User'
          };
        });
        setUserProfiles(profiles);
      }
    });

    return () => unsubscribe();
  }, []);

  return userProfiles;
}