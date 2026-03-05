
const admin = require('firebase-admin');

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

admin.initializeApp({
  projectId: 'web-app-30504'
});

const db = admin.firestore();
const appId = 'default-app-id';

async function checkProfiles() {
  console.log("Checking profiles in 'artifacts/default-app-id/profiles'...");
  const profilesCol = db.collection('artifacts').doc(appId).collection('profiles');
  const snapshot = await profilesCol.get();
  
  if (snapshot.empty) {
    console.log("No profiles found.");
    return;
  }

  snapshot.forEach(doc => {
    console.log(`User: ${doc.id}`, doc.data());
  });
}

checkProfiles().catch(console.error);
