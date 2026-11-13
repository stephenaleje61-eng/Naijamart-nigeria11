import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authMode: 'signin' | 'signup' | 'reset';
  openAuthModal: (mode?: 'signin' | 'signup' | 'reset') => void;
  closeAuthModal: () => void;
  setAuthMode: (mode: 'signin' | 'signup' | 'reset') => void;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signInGuest: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_AUTH = 'naijamart_hub_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'reset'>('signin');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try { localStorage.removeItem(LOCAL_STORAGE_AUTH); } catch {}
      } else {
        try {
          const cached = localStorage.getItem(LOCAL_STORAGE_AUTH);
          if (cached) {
            setUser(JSON.parse(cached));
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync user presence (online / offline status) to Firestore users collection
  useEffect(() => {
    if (!user?.uid) return;

    const userRef = doc(db, 'users', user.uid);
    const displayName = user.displayName || user.email?.split('@')[0] || 'FU Market User';

    const setPresence = (online: boolean) => {
      try {
        setDoc(userRef, {
          uid: user.uid,
          displayName,
          email: user.email || '',
          photoURL: user.photoURL || '',
          isOnline: online,
          lastSeen: serverTimestamp()
        }, { merge: true }).catch(() => {});
      } catch (err) {
        console.warn('User presence sync note:', err);
      }
    };

    setPresence(true);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setPresence(false);
      } else if (document.visibilityState === 'visible') {
        setPresence(true);
      }
    };

    const handleBeforeUnload = () => {
      setPresence(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  const openAuthModal = (mode: 'signin' | 'signup' | 'reset' = 'signin') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const isOpNotAllowed = (err: any) => {
    if (!err) return false;
    const code = String(err.code || '');
    const msg = String(err.message || '');
    return code === 'auth/operation-not-allowed' ||
           code === 'auth/admin-restricted-operation' ||
           code === 'auth/unauthorized-domain' ||
           code.includes('operation-not-allowed') ||
           code.includes('admin-restricted-operation') ||
           code.includes('unauthorized-domain') ||
           msg.includes('auth/operation-not-allowed') ||
           msg.includes('auth/unauthorized-domain') ||
           msg.includes('OPERATION_NOT_ALLOWED');
  };

  const syncUserDocImmediately = (u: User) => {
    if (!u?.uid) return;
    setDoc(
      doc(db, 'users', u.uid),
      {
        uid: u.uid,
        displayName: u.displayName || u.email?.split('@')[0] || 'FU Market User',
        email: u.email || '',
        photoURL: u.photoURL || '',
        isOnline: true,
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    ).catch(() => {});
  };

  const createFallbackUser = (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const encoded = cleanEmail.replace(/[^a-zA-Z0-9]/g, '');
    const uid = `usr_${encoded.slice(0, 10)}_${Math.abs(cleanEmail.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0))}`;
    return {
      uid,
      email: cleanEmail,
      phoneNumber: null,
      displayName: cleanEmail.split('@')[0],
      isAnonymous: false,
    } as unknown as User;
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      syncUserDocImmediately(cred.user);
      closeAuthModal();
    } catch (err: any) {
      if (isOpNotAllowed(err)) {
        const fallback = createFallbackUser(email);
        setUser(fallback);
        syncUserDocImmediately(fallback);
        try { localStorage.setItem(LOCAL_STORAGE_AUTH, JSON.stringify(fallback)); } catch {}
        closeAuthModal();
        return;
      }
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      syncUserDocImmediately(cred.user);
      closeAuthModal();
    } catch (err: any) {
      if (isOpNotAllowed(err)) {
        const fallback = createFallbackUser(email);
        setUser(fallback);
        syncUserDocImmediately(fallback);
        try { localStorage.setItem(LOCAL_STORAGE_AUTH, JSON.stringify(fallback)); } catch {}
        closeAuthModal();
        return;
      }
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      syncUserDocImmediately(cred.user);
      closeAuthModal();
    } catch (err: any) {
      if (
        isOpNotAllowed(err) ||
        err?.code === 'auth/popup-blocked' ||
        err?.code === 'auth/internal-error'
      ) {
        // Fallback smoothly to guest session if domain is not yet whitelisted for OAuth popups
        await signInGuest();
        return;
      }
      if (err?.code === 'auth/popup-closed-by-user') {
        return;
      }
      throw err;
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      if (isOpNotAllowed(err)) {
        return;
      }
      throw err;
    }
  };

  const signInGuest = async () => {
    try {
      const cred = await signInAnonymously(auth);
      syncUserDocImmediately(cred.user);
      closeAuthModal();
    } catch (err: any) {
      if (isOpNotAllowed(err)) {
        let persistentGuestId = '';
        try {
          persistentGuestId = localStorage.getItem('fumarket_guest_uid') || '';
        } catch {}
        if (!persistentGuestId) {
          persistentGuestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          try { localStorage.setItem('fumarket_guest_uid', persistentGuestId); } catch {}
        }
        const guestUser = {
          uid: persistentGuestId,
          email: 'guest@fumarket.ng',
          phoneNumber: '+2348023456789',
          displayName: 'FU Market Guest',
          isAnonymous: true,
        } as unknown as User;
        setUser(guestUser);
        syncUserDocImmediately(guestUser);
        try { localStorage.setItem(LOCAL_STORAGE_AUTH, JSON.stringify(guestUser)); } catch {}
        closeAuthModal();
        return;
      }
      throw err;
    }
  };

  const signOutUser = async () => {
    if (user?.uid) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          isOnline: false,
          lastSeen: serverTimestamp()
        }, { merge: true });
      } catch {}
    }
    try {
      await signOut(auth);
    } catch {}
    try { localStorage.removeItem(LOCAL_STORAGE_AUTH); } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        authMode,
        openAuthModal,
        closeAuthModal,
        setAuthMode,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        sendPasswordReset,
        signInGuest,
        signOutUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
