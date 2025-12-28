import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Force persistence to local storage
setPersistence(auth, browserLocalPersistence);

const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true
});

const functions = getFunctions(app);
const storage = getStorage(app);

let analytics;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// No emulator connections when using live Firebase services for dev
// if (import.meta.env.DEV) {
//   console.log("🔧 DEBUG: Connecting Emulators via Vite Proxy...");
//   // connectAuthEmulator(auth, "http://localhost:5173/firebase-auth-emulator", { disableWarnings: true });    
//   connectFirestoreEmulator(db, "127.0.0.1", 8080);
//   connectFunctionsEmulator(functions, "127.0.0.1", 5001);
//   connectStorageEmulator(storage, "127.0.0.1", 9199);
// }

export { app, auth, db, functions, storage, analytics };
