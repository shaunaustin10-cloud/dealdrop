import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collectionGroup, getDocs, query } from "firebase/firestore";
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
  
  console.log("\nSearching for 'Jewell' in ALL private pipelines (collectionGroup 'deals')...");
  try {
      const dealsGroupRef = collectionGroup(db, 'deals');
      const snapshot = await getDocs(dealsGroupRef);
      
      let foundDeals = 0;
      snapshot.forEach(doc => {
          const data = doc.data();
          if (data.address && data.address.toLowerCase().includes('jewell')) {
              console.log(`Found in deals: ID=${doc.id}, Address=${data.address}, User/Path=${doc.ref.path}`);
              foundDeals++;
          }
      });
      if (foundDeals === 0) console.log("Not found in any user's 'deals' collection.");
  } catch (e) {
      console.log("Error reading deals:", e.message);
  }
  
  console.log("\nSearching for 'Jewell' in ALL publicDeals (collectionGroup 'publicDeals')...");
  try {
      const pubGroupRef = collectionGroup(db, 'publicDeals');
      const snapshot = await getDocs(pubGroupRef);
      
      let foundPubs = 0;
      snapshot.forEach(doc => {
          const data = doc.data();
          if (data.address && data.address.toLowerCase().includes('jewell')) {
              console.log(`Found in publicDeals: ID=${doc.id}, Address=${data.address}, User/Path=${doc.ref.path}`);
              foundPubs++;
          }
      });
      if (foundPubs === 0) console.log("Not found in any 'publicDeals' collection.");
  } catch (e) {
      console.log("Error reading publicDeals:", e.message);
  }
  
  process.exit(0);
}

checkLiveDB().catch(console.error);
