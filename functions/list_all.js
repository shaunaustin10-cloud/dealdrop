
const admin = require('firebase-admin');

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

admin.initializeApp({
  projectId: 'web-app-30504'
});

const db = admin.firestore();

async function listAll() {
  console.log("Listing all collections...");
  const collections = await db.listCollections();
  for (const col of collections) {
    console.log(`Collection: ${col.id}`);
    const snapshot = await col.limit(5).get();
    snapshot.forEach(doc => {
      console.log(`  Doc: ${doc.id}`, doc.data());
    });
  }
}

listAll().catch(console.error);
