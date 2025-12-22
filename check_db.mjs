
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "web-app-30504",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// In Node.js, we need to tell it where the emulator is
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

const appId = 'default-app-id';

async function checkProfiles() {
  console.log("Checking profiles in 'artifacts/default-app-id/profiles'...");
  const profilesCol = collection(db, 'artifacts', appId, 'profiles');
  const snapshot = await getDocs(profilesCol);
  
  if (snapshot.empty) {
    console.log("No profiles found.");
    return;
  }

  snapshot.forEach(doc => {
    console.log(`User: ${doc.id}`, doc.data());
  });
}

checkProfiles().catch(console.error);
