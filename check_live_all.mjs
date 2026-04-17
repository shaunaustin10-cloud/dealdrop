import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, getCountFromServer } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const appId = process.env.VITE_APP_ID || 'default-app-id';

async function checkCollections() {
  console.log(`Checking LIVE database for App ID: ${appId}...`);
  
  const collectionsToCheck = [
    'publicDeals',
    'deals',
    'foreclosureLeads',
    'profiles',
    'users'
  ];

  for (const colName of collectionsToCheck) {
    try {
      const colRef = collection(db, 'artifacts', appId, colName);
      const snapshot = await getCountFromServer(colRef);
      console.log(`- Collection '${colName}': ${snapshot.data().count} documents`);
    } catch (e) {
      console.error(`- Error checking '${colName}': ${e.message}`);
    }
  }
}

checkCollections().catch(console.error);
