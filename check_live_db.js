import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import fetch from "node-fetch";

// Polyfill fetch for Firebase
global.fetch = fetch;

const firebaseConfig = {
  apiKey: "AIzaSyC2g7fiZBjixZyXXqRJu3dvx_9EZzHqi4Y",
  authDomain: "web-app-30504.firebaseapp.com",
  projectId: "web-app-30504"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkLiveDB() {
  console.log("--- Connecting to LIVE Firebase (No Emulators) ---");
  
  const appIds = ['default-app-id', 'dealdrop-prod', 'web-app-30504'];
  const uid = 'EtBf6TPrJJM1GYCALo0otalQ1Qu1'; // Your UID from the error log

  for (const id of appIds) {
    console.log(`\nChecking Folder: ${id}`);
    try {
      // Check for your profile
      const profileRef = doc(db, 'artifacts', id, 'profiles', uid);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        console.log(`  ✅ Profile Found! Role: ${profileSnap.data().role}`);
      } else {
        console.log(`  ❌ No profile found.`);
      }

      // Check for your deals
      const dealsRef = collection(db, 'artifacts', id, 'users', uid, 'deals');
      const dealsSnap = await getDocs(dealsRef);
      console.log(`  📦 Deals Found: ${dealsSnap.size}`);

      // Check for Foreclosures
      const foreclosuresRef = collection(db, 'artifacts', id, 'foreclosureLeads');
      const foreclosuresSnap = await getDocs(foreclosuresRef);
      console.log(`  🏠 Foreclosures Found: ${foreclosuresSnap.size}`);
      
    } catch (e) {
      console.log(`  ⚠️ Error reading ${id}: ${e.message}`);
    }
  }
}

checkLiveDB();
