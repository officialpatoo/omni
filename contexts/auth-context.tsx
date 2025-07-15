
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Auth, User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import type { User } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<FirebaseUser | null>;
  signUp: (email: string, pass: string) => Promise<FirebaseUser | null>;
  signOut: () => Promise<void>;
  resetPassword: () => Promise<void>;
  signInWithGoogle: () => Promise<FirebaseUser | null>;
  signInWithGitHub: () => Promise<FirebaseUser | null>;
  signInWithFacebook: () => Promise<FirebaseUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string): Promise<FirebaseUser | null> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      return userCredential.user;
    } catch (error) {
      console.error("Sign in error", error);
      throw error; // Re-throw to be caught by UI
    }
  };
  
  const signUp = async (email: string, pass: string): Promise<FirebaseUser | null> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      return userCredential.user;
    } catch (error) {
      console.error("Sign up error", error);
      throw error; // Re-throw to be caught by UI
    }
  };

  const socialSignIn = async (provider: GoogleAuthProvider | GithubAuthProvider | FacebookAuthProvider): Promise<FirebaseUser | null> => {
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error("Social sign in error", error);
        throw error;
    }
  };

  const signInWithGoogle = () => socialSignIn(new GoogleAuthProvider());
  const signInWithGitHub = () => socialSignIn(new GithubAuthProvider());
  const signInWithFacebook = () => socialSignIn(new FacebookAuthProvider());

  const signOut = async () => {
    setIsLoading(true);
    await firebaseSignOut(auth);
    setUser(null);
    setIsLoading(false);
    router.push('/auth/login'); // Redirect to login after sign out
  };

  const resetPassword = async () => {
    if (auth.currentUser?.email) {
      try {
        await sendPasswordResetEmail(auth, auth.currentUser.email);
      } catch (error) {
        console.error("Password reset error", error);
        throw error;
      }
    } else {
      throw new Error("No authenticated user with an email found to reset password for.");
    }
  };


  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithGoogle,
    signInWithGitHub,
    signInWithFacebook,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
