import admin from 'firebase-admin';

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8081';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

admin.initializeApp({ projectId: 'web-app-30504' });

const auth = admin.auth();
const db = admin.firestore();
const appId = 'web-app-30504';

async function createAdmin() {
    const email = 'admin@dealdrop.com';
    const password = 'password123';

    console.log(`Creating admin user: ${email}...`);
    
    let user;
    try {
        user = await auth.createUser({
            email,
            password,
            displayName: 'System Admin'
        });
        console.log("Auth user created.");
    } catch (e) {
        if (e.code === 'auth/email-already-exists') {
            user = await auth.getUserByEmail(email);
            console.log("User already exists, updating role...");
        } else {
            throw e;
        }
    }

    const profileRef = db.collection('artifacts').doc(appId).collection('profiles').doc(user.uid);
    await profileRef.set({
        email,
        displayName: 'System Admin',
        role: 'admin',
        subscriptionTier: 'agency',
        credits: null,
        joinedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log("Admin profile created in Firestore.");
    console.log("\n--- LOGIN CREDENTIALS ---");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("--------------------------");
}

createAdmin().catch(console.error);
