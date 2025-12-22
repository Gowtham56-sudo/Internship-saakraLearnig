// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
 apiKey: "AIzaSyBGAnfmo2xTDdI4PPdxwe65OTKrZhTgdY0",
  authDomain: "saakra-learnings.firebaseapp.com",
  projectId: "saakra-learnings",
  storageBucket: "saakra-learnings.firebasestorage.app",
  messagingSenderId: "967320204828",
  appId: "1:967320204828:web:bd47dd543ce459b7bb91d9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);