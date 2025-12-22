
const admin = require('firebase-admin');

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

admin.initializeApp({
  projectId: 'web-app-30504'
});

const db = admin.firestore();

async function listDeep() {
  console.log("Searching for profiles...");
  const artifactsCol = db.collection('artifacts');
  const artifacts = await artifactsCol.get();
  
  if (artifacts.empty) {
    console.log("No artifacts found.");
    return;
  }

  for (const artDoc of artifacts.docs) {
    console.log(`Artifact: ${artDoc.id}`);
    const profilesCol = artDoc.ref.collection('profiles');
    const profiles = await profilesCol.get();
    profiles.forEach(p => {
        console.log(`  Profile: ${p.id}`, p.data());
    });
  }
}

listDeep().catch(console.error);
