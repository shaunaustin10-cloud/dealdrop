import 'dotenv/config';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Production vs Emulator Logic
if (process.env.FIREBASE_SERVICE_ACCOUNT || fs.existsSync('./service-account.json')) {
    // GitHub Actions / Production environment
    console.log("Using Service Account for Production upload...");
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : JSON.parse(fs.readFileSync('./service-account.json', 'utf8'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
    });
} else if (process.env.FIRESTORE_EMULATOR_HOST) {
    // Local Emulator environment
    console.log(`Using Firestore Emulator: ${process.env.FIRESTORE_EMULATOR_HOST}`);
    admin.initializeApp({ projectId: 'web-app-30504' });
} else {
    console.error("No database connection configured (Set FIREBASE_SERVICE_ACCOUNT or FIRESTORE_EMULATOR_HOST)");
    process.exit(1);
}

const db = admin.firestore();
const appId = process.env.VITE_APP_ID || 'default-app-id';

async function uploadLeads() {
    const leadsPath = path.join(process.cwd(), 'foreclosures.json');
    if (!fs.existsSync(leadsPath)) {
        console.error("foreclosures.json not found!");
        return;
    }

    const leads = JSON.parse(fs.readFileSync(leadsPath, 'utf8'));
    console.log(`Uploading ${leads.length} leads to Firestore...`);

    const leadsRef = db.collection('artifacts').doc(appId).collection('foreclosureLeads');
    
    let count = 0;
    for (const lead of leads) {
        // Use normalized address as ID to prevent duplicates
        const docId = lead.address.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const docRef = leadsRef.doc(docId);
        
        await docRef.set({
            ...lead,
            status: lead.status || 'new',
            // Only set dateAdded if it's a new document
            dateAdded: admin.firestore.Timestamp.now(), 
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        count++;
        if (count % 10 === 0) console.log(`Processed ${count}/${leads.length}...`);
    }

    console.log("Upload complete!");
}

uploadLeads().catch(err => {
    console.error("Upload Error:", err);
    process.exit(1);
});
