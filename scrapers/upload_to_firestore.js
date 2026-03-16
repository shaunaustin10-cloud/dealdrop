import 'dotenv/config';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initializeApp() {
    // Force emulator for testing in this environment if needed
    if (process.env.FIRESTORE_EMULATOR_HOST) {
        console.log(`Using Firestore Emulator: ${process.env.FIRESTORE_EMULATOR_HOST}`);
        admin.initializeApp({ projectId: 'web-app-30504' });
        return;
    }

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        console.log("Using Service Account from Environment Variable...");
        try {
            const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            if (sa.private_key) {
                sa.private_key = sa.private_key.replace(/\\n/g, '\n');
            }
            admin.initializeApp({
                credential: admin.credential.cert(sa),
                projectId: sa.project_id || 'web-app-30504'
            });
            return;
        } catch (e) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT env var:", e.message);
        }
    }

    const saPath = path.join(__dirname, 'service-account.json');
    if (fs.existsSync(saPath)) {
        console.log("Using service-account.json file...");
        try {
            // Direct object construction to bypass path parsing issues
            const raw = fs.readFileSync(saPath, 'utf8');
            let sa;
            try {
                sa = JSON.parse(raw);
            } catch (err) {
                // Try with workaround for local file malformations
                sa = JSON.parse(raw.replace(/\\y/g, 'y').replace(/\n(?!( *\"|\}))/g, '\\n'));
            }
            
            // Fix private key formatting for Node 18+ / OpenSSL 3.0
            if (sa.private_key) {
                sa.private_key = sa.private_key.replace(/\\n/g, '\n');
            }
            admin.initializeApp({
                credential: admin.credential.cert(sa),
                projectId: sa.project_id || 'web-app-30504'
            });
        } catch (e) {
             console.error("Failed to parse service-account.json:", e.message);
             process.exit(1);
        }
    } else {
        console.error("No database connection configured");
        process.exit(1);
    }
}

const appId = 'web-app-30504';

async function uploadLeads() {
    await initializeApp();
    const db = admin.firestore();

    const leadsPath = path.join(__dirname, 'foreclosures.json');
    if (!fs.existsSync(leadsPath)) {
        console.error("foreclosures.json not found!");
        return;
    }

    const leads = JSON.parse(fs.readFileSync(leadsPath, 'utf8'));
    console.log(`Processing ${leads.length} leads...`);

    const leadsRef = db.collection('artifacts').doc(appId).collection('foreclosureLeads');
    
    let totalProcessed = 0;
    let newLeadsCount = 0;
    let updatedLeadsCount = 0;

    for (const lead of leads) {
        if (!lead.address) continue;

        let docId = lead.address.toLowerCase().replace(/[^a-z0-9]/g, '_');
        if (docId.length > 100) {
            docId = docId.substring(0, 100);
        }
        const docRef = leadsRef.doc(docId);
        
        const docSnap = await docRef.get();
        const isNew = !docSnap.exists;

        if (isNew) {
            newLeadsCount++;
        } else {
            updatedLeadsCount++;
        }

        await docRef.set({
            ...lead,
            status: lead.status || 'new',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            isNewLead: isNew
        }, { merge: true });
        
        totalProcessed++;
        if (totalProcessed % 50 === 0) console.log(`Processed ${totalProcessed}/${leads.length}...`);
    }

    console.log(`\n--- Upload Summary ---`);
    console.log(`Total Scraped: ${leads.length}`);
    console.log(`New Leads Added: ${newLeadsCount}`);
    console.log(`Existing Leads Updated: ${updatedLeadsCount}`);
    console.log(`✅ ${totalProcessed} leads uploaded successfully!`);
}

uploadLeads().catch(err => {
    console.error("Upload Error:", err);
    process.exit(1);
});
