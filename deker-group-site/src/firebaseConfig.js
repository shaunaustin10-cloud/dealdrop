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
// FORCE LIVE DATA for Deker Group Preview to verify deployments
const useEmulators = false; 

let firestoreSettings = { 
  ignoreUndefinedProperties: true,
};

const db = initializeFirestore(app, firestoreSettings);

const functions = getFunctions(app);
const storage = getStorage(app);

let analytics;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// Emulator logic disabled for this site preview
if (isDev && useEmulators) {
  console.log("🔧 DEBUG: Connecting Emulators...");
  
  const emulatorHost = window.location.hostname;
  const emulatorUrl = window.location.origin;
  
  // Auth: Use the Vite Proxy (origin) to handle the routing to 9099
  connectAuthEmulator(auth, emulatorUrl, { disableWarnings: true });    
  
  // Firestore: Handled via initializeFirestore settings above for Proxy.
  // Only use connectFirestoreEmulator if we are on true localhost to avoid conflicts.
  if (emulatorHost === 'localhost' || emulatorHost === '127.0.0.1') {
      connectFirestoreEmulator(db, '127.0.0.1', 8081);
  }

  // Storage: Needs a hack to force HTTPS for Codespaces Proxy
  // The standard connectStorageEmulator forces 'http', which fails with Mixed Content on Codespaces.
  if (emulatorHost === 'localhost' || emulatorHost === '127.0.0.1') {
      connectStorageEmulator(storage, '127.0.0.1', 9199);
  } else {
      // Hack for Firebase SDK v10+ in Codespaces
      // This routes requests to https://<codespace-url>/v0/b/... -> Vite Proxy -> Emulator
      try {
          // For Firebase v10, the properties are in the delegate's serviceInfo
          if (storage._delegate && storage._delegate._serviceInfo) {
              storage._delegate._serviceInfo.protocol = 'https';
              storage._delegate._serviceInfo.host = window.location.host;
              console.log("✅ DEBUG: Applied Storage HTTPS Proxy Hack (v10 style)");
          } else {
              // Fallback for other versions
              storage._protocol = 'https';
              storage._host = window.location.host;
              console.log("✅ DEBUG: Applied Storage HTTPS Proxy Hack (Legacy style)");
          }
      } catch (err) {
          console.error("❌ DEBUG: Failed to apply Storage Proxy Hack:", err);
      }
  }

  // Functions:
  if (emulatorHost === 'localhost' || emulatorHost === '127.0.0.1') {
      connectFunctionsEmulator(functions, '127.0.0.1', 5173);
  } else {
      // Codespaces: Use standard HTTPS port (443) but force protocol
      const ssl = window.location.protocol === 'https:';
      const port = parseInt(window.location.port) || (ssl ? 443 : 80);
      connectFunctionsEmulator(functions, emulatorHost, port);
      
      // Hack: Force HTTPS for Functions Emulator in Codespaces
      // This ensures requests go to https://<codespace-url>/...
      if (ssl) {
          functions._url = window.location.origin; // For some SDK versions
          functions._emulatorOrigin = window.location.origin; // For others
          functions.customDomain = window.location.origin; // Possible future proofing
          console.log("🔧 DEBUG: Applied Functions HTTPS Proxy Hack");
      }
  }
}

export { app, auth, db, functions, storage, analytics };
