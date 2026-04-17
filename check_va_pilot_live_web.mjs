import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, limit } from "firebase/firestore";
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
const appId = process.env.VITE_FIREBASE_PROJECT_ID;

async function checkLeads() {
  console.log(`Checking LIVE VAPilot leads in artifacts/${appId}/foreclosureLeads...`);
  const leadsRef = collection(db, 'artifacts', appId, 'foreclosureLeads');
  const q = query(leadsRef, where('source', '==', 'VAPilot'), limit(5));
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log('No VAPilot leads found.');
    return;
  }

  console.log(`Found leads.`);
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`- ${data.address} | Sale Date: ${data.saleDate} | Status: ${data.status}`);
  });
}

checkLeads().catch(console.error);
