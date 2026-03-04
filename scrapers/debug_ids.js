import admin from 'firebase-admin';

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8081';
admin.initializeApp({ projectId: 'web-app-30504' });

const db = admin.firestore();

async function listArtifacts() {
    const collections = await db.collection('artifacts').listDocuments();
    console.log("Found App IDs in 'artifacts':");
    collections.forEach(doc => console.log(` - ${doc.id}`));
}

listArtifacts().catch(console.error);
