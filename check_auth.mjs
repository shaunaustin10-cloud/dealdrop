import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, getDoc, query, limit } from "firebase/firestore";
import fetch from "node-fetch";

global.fetch = fetch;

const firebaseConfig = {
  apiKey: "AIzaSyC2g7fiZBjixZyXXqRJu3dvx_9EZzHqi4Y",
  authDomain: "web-app-30504.firebaseapp.com",
  projectId: "web-app-30504"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function checkLiveDB() {
  console.log("--- Connecting to LIVE Firebase ---");
  
  const testEmail = "admin_seed_script@reidealdrop.com";
  const testPassword = "SuperSecretPassword123!";
  
  try {
      await signInWithEmailAndPassword(auth, testEmail, testPassword);
      console.log("Successfully signed in.");
  } catch (e) {
      console.log("Auth failed:", e.message);
      process.exit(1);
  }
  
  const appIds = ['default-app-id', 'dealdrop-prod', 'web-app-30504', '1:743890283978:web:5f27064ff3fad333e33333'];
  
  for (const id of appIds) {
    console.log(`\nChecking Folder: ${id}`);
    try {
      const pubDeals = await getDocs(query(collection(db, 'artifacts', id, 'publicDeals'), limit(10)));
      console.log(`  Public Deals: ${pubDeals.size}`);

      const foreclosures = await getDocs(query(collection(db, 'artifacts', id, 'foreclosureLeads'), limit(10)));
      console.log(`  Foreclosures: ${foreclosures.size}`);
    } catch (e) {
      console.log(`  ⚠️ Error reading ${id}: ${e.message}`);
    }
  }
  process.exit(0);
}

checkLiveDB().catch(console.error);
