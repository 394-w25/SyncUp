import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
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


export const fetchParticipants = async (meetingId, event) => {
  try {
    const participantsRef = collection(db, "users"); // Replace 'participants' with your collection name
    const snapshot = await getDocs(participantsRef);
    const participants = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(), // Includes 'name', 'email'
    }));
    return participants;
  } catch (error) {
    console.error("Error fetching participants:", error);
    return [];
  }
};

export default app;
