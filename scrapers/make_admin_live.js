
import admin from 'firebase-admin';

// No emulator env vars here - we want to target the LIVE project
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.error("Please set FIREBASE_SERVICE_ACCOUNT env var with the JSON key content.");
    process.exit(1);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();
const auth = admin.auth();
const appId = 'default-app-id';

async function makeAdmin(email) {
  try {
    const user = await auth.getUserByEmail(email);
    console.log(`Found user: ${user.email} (${user.uid})`);
    
    const profileRef = db.collection('artifacts').doc(appId).collection('profiles').doc(user.uid);
    
    await profileRef.set({
      role: 'admin',
      subscriptionTier: 'agency',
      credits: null // Unlimited
    }, { merge: true });
    
    console.log(`✅ ${email} is now an ADMIN on the live site.`);
  } catch (error) {
    console.error("Error making user admin:", error);
  }
}

const targetEmail = process.argv[2] || 'test@gmail.com';
makeAdmin(targetEmail).catch(console.error);
