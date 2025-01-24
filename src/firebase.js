import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAj1UJduxyo8fCYF8HAj_Ah-T-KzjO7w0s",
  authDomain: "syncup-5bc71.firebaseapp.com",
  projectId: "syncup-5bc71",
  storageBucket: "syncup-5bc71.firebasestorage.app",
  messagingSenderId: "308692654908",
  appId: "1:308692654908:web:87ce0804e1cdf0f7665c39",
  measurementId: "G-EQ3VSWJRBL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, GoogleAuthProvider, signInWithPopup };