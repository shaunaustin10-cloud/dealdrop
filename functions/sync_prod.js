const admin = require('firebase-admin');

// NOTE: This script runs against the LIVE production database.
// It initializes the counter for the Founding Member offer.

const projectId = "web-app-30504";
const appId = "dealdrop-prod";

admin.initializeApp({
  projectId: projectId
});

const db = admin.firestore();

async function syncProd() {
  console.log(`🚀 Initializing Production Stats for ${projectId}...`);
  
  const statsRef = db.collection('artifacts').doc(appId).collection('stats').doc('subscriptions');
  
  const snap = await statsRef.get();
  if (!snap.exists) {
      console.log("Creating subscriptions stats document...");
      await statsRef.set({
          foundingMemberCount: 0,
          totalMembers: 0,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log("✅ Stats initialized to 0.");
  } else {
      console.log("✅ Stats document already exists. Current count:", snap.data().foundingMemberCount);
  }
}

syncProd().catch(console.error);
