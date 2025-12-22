import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = import.meta.env.DEV
  ? {
      // PASTE YOUR LIVE FIREBASE PROJECT CONFIGURATION HERE
      // You can find this in your Firebase Console -> Project settings -> General -> Your apps -> Firebase SDK snippet (Config)
      apiKey: "AIzaSyC2g7fiZBjixZyXXqRJu3dvx_9EZzHqi4Y",
  authDomain: "web-app-30504.firebaseapp.com",
  projectId: "web-app-30504",
  storageBucket: "web-app-30504.firebasestorage.app",
  messagingSenderId: "743890283978",
  appId: "1:743890283978:web:5f27064ff3fad333e33333"
    }
  : {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Use a more robust Firestore initialization for cloud environments
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
  ignoreUndefinedProperties: true
});

const functions = getFunctions(app);
const storage = getStorage(app);

// No emulator connections when using live Firebase services for dev
// if (import.meta.env.DEV) {
//   console.log("🔧 DEBUG: Connecting Emulators via Vite Proxy...");
//   // connectAuthEmulator(auth, "http://localhost:5173/firebase-auth-emulator", { disableWarnings: true });    
//   connectFirestoreEmulator(db, "127.0.0.1", 8080);
//   connectFunctionsEmulator(functions, "127.0.0.1", 5001);
//   connectStorageEmulator(storage, "127.0.0.1", 9199);
// }

export { app, auth, db, functions, storage };
