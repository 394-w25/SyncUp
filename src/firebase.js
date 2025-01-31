import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore'; // ✅ Import `collection`, `getDocs`

const firebaseConfig = {
  apiKey: "AIzaSyAj1UJduxyo8fCYF8HAj_Ah-T-KzjO7w0s",
  authDomain: "syncup-5bc71.firebaseapp.com",
  projectId: "syncup-5bc71",
  storageBucket: "syncup-5bc71.firebasestorage.app",
  messagingSenderId: "308692654908",
  appId: "1:308692654908:web:87ce0804e1cdf0f7665c39",
  measurementId: "G-EQ3VSWJRBL"
};

// Ensure Firebase is only initialized once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Fix: Ensure `collection` is properly imported
const getUsersEmails = async () => {
  try {
    const usersRef = collection(db, "users"); // This was causing the "collection is not defined" error
    const usersSnapshot = await getDocs(usersRef);
    const users = {};

    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.email) {
        users[userData.uid] = userData.email;
      }
    });

    console.log("✅ Fetched user emails:", users);
    return users;
  } catch (error) {
    console.error("❌ Error fetching user emails:", error);
    throw error;
  }
};

export { auth, db, GoogleAuthProvider, signInWithPopup, getUsersEmails };
