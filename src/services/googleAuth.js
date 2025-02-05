import { GoogleAuthProvider, signInWithPopup, getAuth , signOut as firebaseSignOut} from "firebase/auth";
import { setDoc, doc, updateDoc } from "firebase/firestore";
import { gapi } from "gapi-script";
import { db } from '../firebase'; // Assuming you have a firebase.js file for Firestore

const auth = getAuth();

const initializeGAPI = async () => {
  return new Promise((resolve, reject) => {
    console.log("🔄 Loading GAPI...");
    gapi.load("client:auth2", async () => {
      try {
        console.log("🚀 Initializing GAPI Client...");
        await gapi.client.init({
          clientId: "308692654908-c3sb5qvhs1nhc8t3lju2n1lqsem6123q.apps.googleusercontent.com",
          apiKey: "AIzaSyALwmIcPkkZnfIXKwbMQa0DBtQ-iqv6bho",
          scope: "https://www.googleapis.com/auth/calendar",
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        });

        console.log("✅ GAPI Initialized!");
        resolve();
      } catch (error) {
        console.error("❌ GAPI Initialization Error:", error);
        reject(error);
      }
    });
  });
};

const signInWithGoogle = async () => {
  try {
    await initializeGAPI(); 
    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/calendar");
    provider.addScope("https://www.googleapis.com/auth/calendar.events");

    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential.accessToken;

    gapi.client.setToken({ access_token: accessToken });
    localStorage.setItem("google-email", user.email);
    
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


const checkGoogleSignInStatus = async () => {
  try {
    console.log("Checking Google Sign-In Status...");

    if (!gapi.auth2) {
      console.log("GAPI auth2 not initialized. Initializing now...");
      await initializeGAPI();
    }

    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance) {
      console.log("❌ GAPI auth instance not available.");
      return false;
    }

    const isSignedIn = authInstance.isSignedIn.get();
    console.log("🔑 Google API Sign-In Status:", isSignedIn);

    return isSignedIn;
  } catch (error) {
    console.error("❌ Error checking Google sign-in status:", error);
    return false;
  }
};

const refreshGoogleToken = async () => {
  const authInstance = gapi.auth2.getAuthInstance();
  if (!authInstance) return;

  const user = authInstance.currentUser.get();
  const authResponse = await user.reloadAuthResponse();
  gapi.client.setToken(authResponse);
  localStorage.setItem("gapi-access-token", authResponse.access_token);
};

const isUserAuthenticated = () => {
  const authInstance = gapi.auth2?.getAuthInstance();
  return authInstance?.isSignedIn.get() || false;
};

// add setUserId and setUserId
const handleAuth = async (setIsAuthenticated, setUserId) => {
    try {
      const user = await signInWithGoogle();
      setIsAuthenticated(true);
      // setUserId(user.uid);
      if (setUserId) setUserId(user.uid); 
      localStorage.setItem('google-auth', 'true');
      localStorage.setItem('user-id', user.uid); // Add this line
      return user;
    } catch (error) {
      console.error('Error during authentication:', error);
      throw error;
    }
};


const updateIsSynced = async (userId) => {
  try {
    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, {
      isSynced: true
    });
    console.log('User calendar sync status updated to true');
  } catch (error) {
    console.error('Error updating sync status:', error);
  }
};

const signOut = async (setIsAuthenticated, setUserId) => {
  try {
    await firebaseSignOut(auth);
    setIsAuthenticated(false);
    setUserId(null);
    localStorage.removeItem("google-auth");
    localStorage.removeItem("user-id");
    console.log("User signed out");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

// export { signInWithGoogle, handleAuth, updateIsSynced, signOut };
export { 
  signInWithGoogle, 
  checkGoogleSignInStatus, 
  refreshGoogleToken, 
  initializeGAPI, 
  signOut, 
  updateIsSynced, 
  handleAuth 
};
