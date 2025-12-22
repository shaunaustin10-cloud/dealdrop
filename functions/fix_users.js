
const admin = require('firebase-admin');
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

admin.initializeApp({ projectId: 'web-app-30504' });
const db = admin.firestore();
const auth = admin.auth();

async function fixAllUsers() {
  const appId = 'default-app-id';
  const { users } = await auth.listUsers();
  
  for (const user of users) {
    console.log(`Fixing user: ${user.email} (${user.uid})`);
    const userRef = db.collection('artifacts').doc(appId).collection('profiles').doc(user.uid);
    
    await userRef.set({
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      subscriptionTier: 'pro',
      credits: 999,
      role: 'wholesaler'
    }, { merge: true });
  }
  console.log("✅ All users fixed with Pro status and credits.");
}

fixAllUsers().catch(console.error);
