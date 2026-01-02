"use client"

import { initializeApp, getApps } from "firebase/app"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"

// Read Firebase config from env; user should set these in .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

if (!getApps().length) {
  initializeApp(firebaseConfig)
}

// Export a shared auth instance after app initialization
export const auth = getAuth()

export async function signIn(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  const token = await cred.user.getIdToken()
  return { token, uid: cred.user.uid, user: cred.user }
}

export default { signIn }
