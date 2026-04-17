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
      const pubDeals = await getDocs(query(collection(db, 'artifacts', id, 'publicDeals')));
      pubDeals.forEach(d => {
          console.log(`  - Public Deal: ${d.data().address}`);
      });
      
      const adminProf = await getDoc(doc(db, 'artifacts', id, 'profiles', auth.currentUser.uid));
      console.log(`  Admin Profile role: ${adminProf.exists() ? adminProf.data().role : 'Not found'}`);
      
      const uids = [auth.currentUser.uid, 'EtBf6TPrJJM1GYCALo0otalQ1Qu1']; // Also check the user's actual UID
      for (const uid of uids) {
          const userProf = await getDoc(doc(db, 'artifacts', id, 'profiles', uid));
          if (userProf.exists()) {
             console.log(`  User Profile ${uid} role: ${userProf.data().role}`);
          }
      }
    } catch (e) {
      console.log(`  ⚠️ Error reading ${id}: ${e.message}`);
    }
  }
  process.exit(0);
}

checkLiveDB().catch(console.error);
