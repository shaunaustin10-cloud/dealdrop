
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "web-app-30504",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// In Node.js, we need to tell it where the emulator is
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';

const appId = 'default-app-id';

async function checkProfiles() {
  console.log("--------------------------------------------------");
  console.log("Checking profiles in 'artifacts/default-app-id/profiles'...");
  console.log("--------------------------------------------------");
  const profilesCol = collection(db, 'artifacts', appId, 'profiles');
  const snapshot = await getDocs(profilesCol);
  
  if (snapshot.empty) {
    console.log("No profiles found.");
    return;
  }

  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`User ID: ${doc.id}`);
    console.log(`Email:   ${data.email || 'N/A'}`);
    console.log(`Role:    ${data.role || 'N/A'}`);
    console.log(`Credits: ${data.credits ?? 'N/A'}`);
    console.log(`Tier:    ${data.subscriptionTier || 'free'}`);
    console.log("--------------------------------------------------");
  });
}

checkProfiles().catch(console.error);
