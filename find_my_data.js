import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import fetch from "node-fetch";

global.fetch = fetch;

const firebaseConfig = {
  apiKey: "AIzaSyC2g7fiZBjixZyXXqRJu3dvx_9EZzHqi4Y",
  authDomain: "web-app-30504.firebaseapp.com",
  projectId: "web-app-30504"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const appIds = ['default-app-id', 'dealdrop-prod', 'web-app-30504', '1:743890283978:web:5f27064ff3fad333e33333'];
  const uid = 'EtBf6TPrJJM1GYCALo0otalQ1Qu1';

  for (const id of appIds) {
    console.log(`\nChecking: ${id}`);
    try {
      const p = await getDoc(doc(db, 'artifacts', id, 'profiles', uid));
      if (p.exists()) console.log(`  Profile: ${p.data().role}`);
      
      const deals = await getDocs(collection(db, 'artifacts', id, 'users', uid, 'deals'));
      console.log(`  Deals: ${deals.size}`);
      
      const pubDeals = await getDocs(collection(db, 'artifacts', id, 'publicDeals'));
      console.log(`  Public Deals: ${pubDeals.size}`);

      const foreclosures = await getDocs(collection(db, 'artifacts', id, 'foreclosureLeads'));
      console.log(`  Foreclosures: ${foreclosures.size}`);
    } catch (e) {
      console.log(`  Error: ${e.message}`);
    }
  }
}
check();
