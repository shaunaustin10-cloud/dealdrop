const admin = require('firebase-admin');

// Initialize Admin SDK pointing to the emulator
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8081";

admin.initializeApp({
  projectId: "web-app-30504"
});

async function seedUser() {
    try {
        const user = await admin.auth().getUserByEmail("demo@example.com");
        console.log("User already exists:", user.uid);
    } catch (e) {
        if (e.code === 'auth/user-not-found') {
            console.log("Creating demo user...");
            const newUser = await admin.auth().createUser({
                email: "demo@example.com",
                password: "password123",
                displayName: "Demo User",
                emailVerified: true
            });
            console.log("User created:", newUser.uid);

            // Also Create Profile in Firestore
            const db = admin.firestore();
            await db.collection('artifacts').doc('default-app-id').collection('profiles').doc(newUser.uid).set({
                email: "demo@example.com",
                displayName: "Demo User",
                role: "investor",
                credits: 10,
                createdAt: new Date(),
                isPro: false
            });
            console.log("Profile created.");
        } else {
            console.error("Error:", e);
        }
    }
}

seedUser();
