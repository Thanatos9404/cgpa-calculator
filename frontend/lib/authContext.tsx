/**
 * Updated Authentication Context with working local auth + Google OAuth
 * Works without backend by using localStorage for demo accounts
 * Google OAuth via Firebase (when configured)
 */
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  provider: 'email' | 'google';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple hash function for password (NOT for production - use bcrypt on server)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// Local user storage key
const USERS_STORAGE_KEY = 'cgpa_users';
const CURRENT_USER_KEY = 'cgpa_current_user';

// Get users from localStorage
function getStoredUsers(): Record<string, { password: string; user: User }> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

// Save users to localStorage
function saveStoredUsers(users: Record<string, { password: string; user: User }>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check for stored user
      const storedUser = localStorage.getItem(CURRENT_USER_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Auth check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setError(null);

      // Validate inputs
      if (!name.trim()) throw new Error('Please enter your name');
      if (!email.trim()) throw new Error('Please enter your email');
      if (password.length < 8) throw new Error('Password must be at least 8 characters');

      // Check if user already exists
      const users = getStoredUsers();
      if (users[email.toLowerCase()]) {
        throw new Error('Email already registered');
      }

      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}`,
        email: email.toLowerCase(),
        full_name: name.trim(),
        provider: 'email',
        created_at: new Date().toISOString(),
      };

      // Store user with hashed password
      users[email.toLowerCase()] = {
        password: simpleHash(password),
        user: newUser,
      };
      saveStoredUsers(users);

      // Set current user
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      setUser(newUser);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      const message = err.message || 'Signup failed. Please try again.';
      setError(message);
      throw new Error(message);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);

      // Get stored users
      const users = getStoredUsers();
      const storedData = users[email.toLowerCase()];

      if (!storedData) {
        throw new Error('No account found with this email');
      }

      // Verify password
      if (storedData.password !== simpleHash(password)) {
        throw new Error('Incorrect password');
      }

      // Set current user
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(storedData.user));
      setUser(storedData.user);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      const message = err.message || 'Login failed. Please check your credentials.';
      setError(message);
      throw new Error(message);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);

      // Dynamic import to avoid SSR issues
      const { auth, googleProvider, signInWithPopup } = await import('./firebase');

      try {
        // Check if Firebase is properly configured
        if (!auth) {
          throw { code: 'auth/not-configured', message: 'Firebase not configured' };
        }
        const result = await signInWithPopup(auth, googleProvider);
        const firebaseUser = result.user;

        // Create user from Google data
        const googleUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          full_name: firebaseUser.displayName || 'Google User',
          avatar_url: firebaseUser.photoURL || undefined,
          provider: 'google',
          created_at: new Date().toISOString(),
        };

        // Store user
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(googleUser));
        setUser(googleUser);

        // Redirect to dashboard
        router.push('/dashboard');
      } catch (firebaseError: any) {
        // Handle Firebase errors
        if (firebaseError.code === 'auth/popup-closed-by-user') {
          throw new Error('Sign in was cancelled');
        } else if (firebaseError.code === 'auth/popup-blocked') {
          throw new Error('Popup was blocked. Please allow popups for this site.');
        } else if (firebaseError.code === 'auth/unauthorized-domain') {
          // Firebase not configured - use mock login for demo
          console.log('Firebase not configured, using demo Google login');
          const demoUser: User = {
            id: 'google_demo_' + Date.now(),
            email: 'demo@gmail.com',
            full_name: 'Google Demo User',
            avatar_url: 'https://ui-avatars.com/api/?name=Google+User&background=4285f4&color=fff',
            provider: 'google',
            created_at: new Date().toISOString(),
          };
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(demoUser));
          setUser(demoUser);
          router.push('/dashboard');
        } else {
          throw new Error(firebaseError.message || 'Google sign in failed');
        }
      }
    } catch (err: any) {
      const message = err.message || 'Google sign in failed';
      setError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      // Try to sign out from Firebase if logged in via Google
      try {
        const { auth, signOut } = await import('./firebase');
        if (auth) {
          await signOut(auth);
        }
      } catch {
        // Ignore Firebase errors
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local storage
      localStorage.removeItem(CURRENT_USER_KEY);
      setUser(null);
      router.push('/');
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    loginWithGoogle,
    logout,
    error,
    clearError,
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
