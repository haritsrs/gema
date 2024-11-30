"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '../../../firebase.js';
import AuthSidebar from '../../components/auth';

export default function ProfileRedirect() {
  const router = useRouter();
  const [showAuthSidebar, setShowAuthSidebar] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      router.replace(`/profile/${user.uid}`);
    } else {
      setShowAuthSidebar(true);
    }
  }, [router]);

  if (showAuthSidebar) {
    return <AuthSidebar />;
  }

  return null;
}