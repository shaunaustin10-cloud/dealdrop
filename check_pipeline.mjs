import 'dotenv/config';
import admin from 'firebase-admin';
import fs from 'fs';

async function checkLiveDB() {
    const raw = fs.readFileSync('scrapers/service-account.json', 'utf8');
    let sa = JSON.parse(raw);
    
    if (sa.private_key) {
        sa.private_key = sa.private_key.replace(/\\n/g, '\n');
    }

    admin.initializeApp({
        credential: admin.credential.cert(sa),
        projectId: sa.project_id || 'web-app-30504'
    });

    const db = admin.firestore();
    const appId = 'default-app-id';

    console.log("Checking live database for '1012 Jewell Ave'...");
    
    // Search deals (Pipeline) across ALL users using collectionGroup
    console.log("\nSearching for 'Jewell' in ALL private pipelines (collectionGroup 'deals')...");
    const dealsGroupRef = db.collectionGroup('deals');
    const snapshot = await dealsGroupRef.get();
    
    let foundDeals = 0;
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.address && data.address.toLowerCase().includes('jewell')) {
            console.log(`Found in deals: ID=${doc.id}, Address=${data.address}, User/Path=${doc.ref.path}`);
            foundDeals++;
        }
    });
    if (foundDeals === 0) console.log("Not found in any user's 'deals' collection.");
}

checkLiveDB().catch(console.error);
