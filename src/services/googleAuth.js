import { GoogleAuthProvider, signInWithPopup, getAuth, signOut as firebaseSignOut } from "firebase/auth";
import { setDoc, doc, updateDoc } from "firebase/firestore";
import { gapi } from "gapi-script";
import { db } from '../firebase';

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
    console.log("⏳ Initializing GAPI...");
    await initializeGAPI();
    console.log("✅ GAPI Initialized!");

    console.log("⏳ Signing in with Firebase...");
    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/calendar");

    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("✅ Firebase sign-in success:", user);

    let authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance) {
      console.error("❌ GAPI auth instance is missing. Trying to reinitialize...");
      await initializeGAPI();
      authInstance = gapi.auth2.getAuthInstance();
    }

    console.log("⏳ Checking GAPI authentication...");
    let isSignedIn = authInstance.isSignedIn.get();
    console.log("🔑 Is user signed in to GAPI?", isSignedIn);

    if (!isSignedIn) {
      console.warn("⚠️ User not signed in. Attempting sign-in...");
      try {
        await authInstance.signIn();
        isSignedIn = authInstance.isSignedIn.get();
        console.log("✅ User signed in successfully:", isSignedIn);
      } catch (error) {
        console.error("❌ Error signing in user:", error);
        return;
      }
    }

    // ✅ **存储当前登录 Google 账户**
    localStorage.setItem("google-email", user.email);

    // Get GAPI Auth Token from the signed-in user
    const gapiUser = authInstance.currentUser.get();
    const authResponse = await gapiUser.reloadAuthResponse(); // ✅ 强制刷新 Token
    gapi.client.setToken(authResponse);
    console.log("✅ Refreshed Google API Token:", authResponse.access_token);

    // Save user info in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      isSynced: false,
    });

    console.log("✅ User signed in and authenticated with GAPI.");
    return user;
  } catch (error) {
    console.error("❌ Error signing in with Google:", error);
    throw error;
  }
};

const checkGoogleSignInStatus = async () => {
  try {
    console.log("🔍 Checking Google Sign-In Status...");

    if (!gapi.client) {
      console.log("❌ GAPI client not initialized. Initializing now...");
      await initializeGAPI();
    }

    const authInstance = gapi.auth2?.getAuthInstance();
    if (!authInstance) {
      console.log("❌ GAPI auth instance not available. Reinitializing...");
      await initializeGAPI();
      return false;
    }

    let isSignedIn = authInstance.isSignedIn.get();
    console.log("🔑 Google API Sign-In Status:", isSignedIn);

    if (!isSignedIn) {
      console.warn("⚠️ User not signed in. Attempting sign-in...");
      try {
        await authInstance.signIn();
        isSignedIn = authInstance.isSignedIn.get();
        console.log("✅ User signed in successfully:", isSignedIn);
      } catch (error) {
        console.error("❌ Error signing in user:", error);
        return false;
      }
    }

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

const updateIsSynced = async (userId) => {
  try {
    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, {
      isSynced: true
    });
    console.log("User calendar sync status updated to true");
  } catch (error) {
    console.error("Error updating sync status:", error);
  }
};

const isUserAuthenticated = () => {
  const authInstance = gapi.auth2?.getAuthInstance();
  return authInstance?.isSignedIn.get() || false;
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

const handleAuth = async (setIsAuthenticated, setUserId) => {
  try {
    const user = await signInWithGoogle();
    setIsAuthenticated(true);
    setUserId(user.uid);
    localStorage.setItem('google-auth', 'true');
    localStorage.setItem('user-id', user.uid);
    return user;
  } catch (error) {
    console.error("Error during authentication:", error);
    throw error;
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
