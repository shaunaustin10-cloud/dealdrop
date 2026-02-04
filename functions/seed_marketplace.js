const admin = require('firebase-admin');

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';

admin.initializeApp({
  projectId: 'dealdrop-prod'
});

const db = admin.firestore();
const appId = 'dealdrop-prod'; // Matching .env

async function seed() {
  const dealData = {
    address: '999 Emulator Test St',
    price: 150000,
    arv: 250000,
    rehab: 40000,
    dealScore: 82,
    originalId: 'test-seed-1',
    status: 'Available',
    publishedAt: admin.firestore.FieldValue.serverTimestamp(),
    sellerId: 'test-admin',
    imageUrls: []
  };

  console.log("Seeding deal to:", `artifacts/${appId}/publicDeals`);
  await db.collection('artifacts').doc(appId).collection('publicDeals').add(dealData);
  console.log("Seed complete.");
}

seed().catch(console.error);