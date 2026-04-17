import 'dotenv/config';
import admin from 'firebase-admin';
import fs from 'fs';

async function main() {
    const raw = fs.readFileSync('scrapers/service-account.json', 'utf8');
    const sa = JSON.parse(raw);
    
    admin.initializeApp({
        credential: admin.credential.cert(sa),
        projectId: sa.project_id
    });
    
    const db = admin.firestore();
    const appId = process.env.VITE_APP_ID || '1:743890283978:web:5f27064ff3fad333e33333';
    
    console.log(`Checking LIVE database for App ID: ${appId}...`);
    
    const collectionsToCheck = [
        'publicDeals',
        'deals',
        'foreclosureLeads',
        'profiles',
        'users'
    ];

    for (const colName of collectionsToCheck) {
        try {
            const colRef = db.collection('artifacts').doc(appId).collection(colName);
            const snapshot = await colRef.count().get();
            console.log(`- Collection '${colName}': ${snapshot.data().count} documents`);
        } catch (e) {
            console.error(`- Error checking '${colName}': ${e.message}`);
        }
    }
}

main().catch(console.error);
