import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
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
const appId = process.env.VITE_APP_ID || 'dealdrop-prod';

async function checkDeals() {
  console.log(`Checking LIVE deals in artifacts/${appId}/publicDeals...`);
  const snapshot = await getDocs(collection(db, 'artifacts', appId, 'publicDeals'));
  
  if (snapshot.empty) {
    console.log('No public deals found.');
    return;
  }

  console.log(`Found ${snapshot.size} deals.`);
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`- ${data.address} | City: ${data.city} | New Construction: ${data.isNewBuild || data.title?.includes('New') || data.description?.includes('New')}`);
  });
}

checkDeals().catch(console.error);
