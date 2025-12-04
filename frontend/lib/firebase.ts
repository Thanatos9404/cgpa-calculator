/**
 * Firebase configuration for Google OAuth
 * Configure credentials in .env.local file
 */
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// Firebase configuration - loaded from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

// Initialize Firebase only if not already initialized and config is valid
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId;
const app = isConfigValid && getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = isConfigValid ? getAuth(app) : null;
const googleProvider = new GoogleAuthProvider();

// Add scopes for Google
googleProvider.addScope('email');
googleProvider.addScope('profile');

export { auth, googleProvider, signInWithPopup, signOut };
