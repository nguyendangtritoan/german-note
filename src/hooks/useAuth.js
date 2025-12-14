import { useState, useEffect } from 'react';
import { 
  signInAnonymously, 
  signInWithPopup, 
  linkWithPopup,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try { await signInWithPopup(auth, googleProvider); } 
    catch (e) { console.error("Google Auth Error:", e); }
  };

  const handleGuestLogin = async () => {
    try { await signInAnonymously(auth); } 
    catch (e) { console.error("Guest Auth Error:", e); }
  };

  const handleLinkGoogleAccount = async () => {
    if (!auth.currentUser) return;
    try {
      await linkWithPopup(auth.currentUser, googleProvider);
    } catch (error) {
      console.error("Link Error:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  return { 
    user, 
    authLoading, 
    handleGoogleLogin, 
    handleGuestLogin, 
    handleLinkGoogleAccount,
    handleLogout
  };
};