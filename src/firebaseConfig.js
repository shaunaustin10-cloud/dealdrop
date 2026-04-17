import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, connectAuthEmulator } from 'firebase/auth';
import { initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
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

// Detect environment
const isDev = import.meta.env.DEV;
let firestoreSettings = { 
  ignoreUndefinedProperties: true,
  experimentalForceLongPolling: true, // Force long polling for better proxy support
};

// Pre-configure Firestore settings for Proxy/Codespaces support if needed
// This avoids using connectFirestoreEmulator which forces SSL=false
if (isDev) {
    const host = window.location.hostname;
    // If we are NOT on localhost (e.g. Codespaces), we need to use the Proxy (same origin)
    if (host !== 'localhost' && host !== '127.0.0.1') {
        const ssl = window.location.protocol === 'https:';
        const port = window.location.port || (ssl ? 443 : 80);
        
        console.log(`🔧 DEBUG: Configuring Firestore for Proxy: ${host}:${port} (SSL=${ssl})`);
        
        firestoreSettings = {
            ...firestoreSettings,
            host: `${host}:${port}`,
            ssl: ssl
        };
    }
}

const db = initializeFirestore(app, firestoreSettings);

const functions = getFunctions(app);
const storage = getStorage(app);

let analytics;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// No emulator connections when using live Firebase services for dev
/*
if (isDev) {
  console.log("🔧 DEBUG: Connecting Emulators...");
...
  }
}
*/

export { app, auth, db, functions, storage, analytics };
