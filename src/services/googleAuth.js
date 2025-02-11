import { GoogleAuthProvider, signInWithPopup, getAuth, signOut as firebaseSignOut } from "firebase/auth";
import { setDoc, doc, updateDoc } from "firebase/firestore";
import { db } from '../firebase';
import { gapi } from "gapi-script";

const auth = getAuth();
const CLIENT_ID = "308692654908-c3sb5qvhs1nhc8t3lju2n1lqsem6123q.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];


const initializeGAPI = async () => {
  if (gapi.auth2?.getAuthInstance()) {
    console.log("✅ GAPI already initialized.");
    return;
  }
  
  return new Promise((resolve, reject) => {
    gapi.load("client:auth2", async () => {
      try {
        await gapi.auth2.init({
          client_id: CLIENT_ID,
          scope: SCOPES,
          discoveryDocs: DISCOVERY_DOCS,
        });
        console.log("🚀 GAPI Initialized Successfully!");
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

    console.log("🔑 User authenticated with Firebase:", user);

    // Set token for gapi client
    gapi.client.setToken({ access_token: accessToken });
    localStorage.setItem("google-email", user.email);

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      isSynced: false,
    });

    console.log("✅ User data saved to Firestore");
    return user;
  } catch (error) {
    console.error("❌ Error signing in with Google:", error);
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

const handleAuth = async (setIsAuthenticated, setUserId) => {
  try {
    const user = await signInWithGoogle();
    setIsAuthenticated(true);
    if (setUserId) setUserId(user.uid);
    localStorage.setItem('google-auth', 'true');
    localStorage.setItem('user-id', user.uid);
    return user;
  } catch (error) {
    console.error('Error during authentication:', error);
    throw error;
  }
};

const updateIsSynced = async (userId) => {
  try {
    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, { isSynced: true });
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

export {
  signInWithGoogle,
  checkGoogleSignInStatus,
  refreshGoogleToken,
  initializeGAPI,
  signOut,
  updateIsSynced,
  handleAuth
};
