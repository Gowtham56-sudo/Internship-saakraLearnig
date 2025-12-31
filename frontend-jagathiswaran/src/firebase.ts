// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBGAnfmo2xTDdI4PPdxwe65OTKrZhTgdY0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "saakra-learnings.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "saakra-learnings",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "saakra-learnings.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "967320204828",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:967320204828:web:bd47dd543ce459b7bb91d9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth helper functions
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    localStorage.setItem('edu_token', token);
    return { user: userCredential.user, token };
  } catch (error: any) {
    throw new Error(error.message || 'Login failed');
  }
};

export const registerWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    localStorage.setItem('edu_token', token);
    return { user: userCredential.user, token };
  } catch (error: any) {
    throw new Error(error.message || 'Registration failed');
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('edu_token');
    localStorage.removeItem('edu_user');
  } catch (error: any) {
    throw new Error(error.message || 'Logout failed');
  }
};

export default app;