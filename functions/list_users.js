
const admin = require('firebase-admin');

process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

admin.initializeApp({
  projectId: 'web-app-30504'
});

async function listUsers() {
  console.log("Listing Auth users...");
  const result = await admin.auth().listUsers();
  result.users.forEach(user => {
    console.log(`User: ${user.uid} (${user.email})`);
  });
}

listUsers().catch(console.error);
