import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAj1UJduxyo8fCYF8HAj_Ah-T-KzjO7w0s",
    authDomain: "syncup-5bc71.firebaseapp.com",
    projectId: "syncup-5bc71",
    storageBucket: "syncup-5bc71.firebasestorage.app",
    messagingSenderId: "308692654908",
    appId: "1:308692654908:web:87ce0804e1cdf0f7665c39",
    measurementId: "G-EQ3VSWJRBL"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
