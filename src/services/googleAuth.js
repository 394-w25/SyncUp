import { GoogleAuthProvider, signInWithPopup, getAuth , signOut as firebaseSignOut} from "firebase/auth";
import { setDoc, doc, updateDoc } from "firebase/firestore";
import { gapi } from "gapi-script";
import { db } from '../firebase'; // Assuming you have a firebase.js file for Firestore

const auth = getAuth();

const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/calendar');
  
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const credential = GoogleAuthProvider.credentialFromResult(result);
  
      // // Use the credential to authenticate GAPI
      // gapi.client.setToken({ access_token: credential.accessToken });
  
      // Save user info to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        isSynced: false,
      });
  
      console.log('User signed in and authenticated');
      return user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

const handleAuth = async (setIsAuthenticated) => {
    try {
      const user = await signInWithGoogle();
      setIsAuthenticated(true);
      localStorage.setItem('google-auth', 'true');
      localStorage.setItem('user-id', user.uid); // Add this line
      return user;
    } catch (error) {
      console.error('Error during authentication:', error);
      throw error;
    }
};

const signOut = async (setIsAuthenticated, setUserId) => {
  try {
    await firebaseSignOut(auth);
    setIsAuthenticated(false);
    setUserId(null);
    localStorage.removeItem('google-auth');
    localStorage.removeItem('user-id');
    console.log('User signed out');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

export { signInWithGoogle, handleAuth, updateIsSynced, signOut };