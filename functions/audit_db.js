const admin = require('firebase-admin');

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

admin.initializeApp({ projectId: 'dealdrop-prod' });

const db = admin.firestore();
const auth = admin.auth();

async function audit() {
  console.log("\n=== 1. LISTING ALL USERS (Auth) ===");
  try {
    const listUsersResult = await auth.listUsers(100);
    if (listUsersResult.users.length === 0) {
        console.log("  No users found in Auth.");
    }
    listUsersResult.users.forEach((userRecord) => {
      console.log(`  - User: ${userRecord.email} (UID: ${userRecord.uid})`);
    });

    console.log("\n=== 2. LISTING ALL DEALS (Firestore) ===");
    // Check both potential App IDs just in case
    const appIds = ['dealdrop-prod', 'default-app-id'];
    
    for (const appId of appIds) {
        console.log(`\nChecking App ID: ${appId}`);
        
        // Check Public Deals
        const pubDeals = await db.collection(`artifacts/${appId}/publicDeals`).get();
        console.log(`  [Public Deals]: ${pubDeals.size} found`);
        pubDeals.forEach(d => console.log(`    > ${d.data().address} (Seller: ${d.data().sellerId})`));

        // Check User Private Deals
        // We need to query the 'users' collection to find subcollections
        const usersRef = db.collection(`artifacts/${appId}/users`);
        const usersSnap = await usersRef.get();
        
        if (usersSnap.empty) {
             console.log("  [Private Deals]: No user records found in Firestore.");
        } else {
            for (const userDoc of usersSnap.docs) {
                const dealsSnap = await userDoc.ref.collection('deals').get();
                console.log(`  [User ${userDoc.id}]: ${dealsSnap.size} private deals`);
                dealsSnap.forEach(d => console.log(`      > ${d.data().address}`));
            }
        }
    }

  } catch (error) {
    console.log('Error listing users:', error);
  }
}

audit();
