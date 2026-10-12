import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleAuthProvider, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types/store';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  updateSavedAddress: (address: UserProfile['savedAddress']) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
  updateSavedAddress: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync user profile to and from Firestore
  const syncProfile = async (user: User) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(userDocRef);

      if (snapshot.exists()) {
        setUserProfile(snapshot.data() as UserProfile);
      } else {
        const newProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Customer',
          email: user.email || '',
          photoURL: user.photoURL || undefined,
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.warn('Could not sync user profile in Firestore (offline or initial boot):', err);
      // Fallback in-memory profile
      setUserProfile({
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Customer',
        email: user.email || '',
        photoURL: user.photoURL || undefined,
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      if (result.user) {
        await syncProfile(result.user);
      }
    } catch (err: unknown) {
      console.error('Google Sign-In failed:', err);
      throw err;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (err) {
      console.error('Sign-Out error:', err);
    }
  };

  const updateSavedAddress = async (savedAddress: UserProfile['savedAddress']) => {
    if (!currentUser) return;
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updated: Partial<UserProfile> = {
        savedAddress,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, updated, { merge: true });
      setUserProfile((prev) => (prev ? { ...prev, savedAddress } : null));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        signInWithGoogle,
        signOutUser,
        updateSavedAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
