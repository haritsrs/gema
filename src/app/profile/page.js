"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '../../../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import AuthSidebar from '../../components/auth';

export default function ProfileRedirect() {
  const router = useRouter();
  const [showAuthSidebar, setShowAuthSidebar] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace(`/profile/${user.uid}`);
      } else {
        setShowAuthSidebar(true);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [router]);

  if (showAuthSidebar) {
    return <AuthSidebar />;
  }

  return null;
}