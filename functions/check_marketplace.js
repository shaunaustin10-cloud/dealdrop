const admin = require('firebase-admin');

// Match firebase.json port (8081)
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';

// Use a dummy project ID that matches the emulator default usually, or just 'demo-project'
admin.initializeApp({
  projectId: 'dealdrop-prod' 
});

const db = admin.firestore();

async function checkCollection(appId) {
  console.log(`\n--- Checking App ID: ${appId} ---`);
  const path = `artifacts/${appId}/publicDeals`;
  console.log(`Querying: ${path}`);
  
  try {
    const snapshot = await db.collection('artifacts').doc(appId).collection('publicDeals').get();
    
    if (snapshot.empty) {
      console.log("  [EMPTY] No public deals found.");
    } else {
      console.log(`  [FOUND] ${snapshot.size} deals.`);
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  - Deal ID: ${doc.id}`);
        console.log(`    Address: ${data.address}`);
        console.log(`    Score: ${data.dealScore || data.score}`);
        console.log(`    OriginalId: ${data.originalId}`);
      });
    }
  } catch (e) {
    console.error(`  [ERROR] Could not read path: ${e.message}`);
  }
}

async function main() {
    await checkCollection('default-app-id');
    await checkCollection('dealdrop-prod');
}

main().catch(console.error);
