import 'dotenv/config';
import admin from 'firebase-admin';
import fs from 'fs';

async function findData() {
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

    const appIds = ['default-app-id', 'dealdrop-prod', 'web-app-30504', '1:743890283978:web:5f27064ff3fad333e33333'];
    
    for (const id of appIds) {
        console.log(`\n=== Checking AppId: ${id} ===`);
        
        const deals = await db.collection('artifacts').doc(id).collection('deals').get();
        console.log(`Pipeline Deals (deals): ${deals.size}`);

        const pubDeals = await db.collection('artifacts').doc(id).collection('publicDeals').get();
        console.log(`Marketplace Deals (publicDeals): ${pubDeals.size}`);

        const foreclosures = await db.collection('artifacts').doc(id).collection('foreclosureLeads').get();
        console.log(`Foreclosures (foreclosureLeads): ${foreclosures.size}`);

        const profiles = await db.collection('artifacts').doc(id).collection('profiles').get();
        console.log(`Profiles: ${profiles.size}`);
        
        profiles.forEach(doc => {
             if (doc.data().role === 'admin') console.log(`  Found Admin Profile: ${doc.id}`);
        });

        // Search for Jewell
        deals.forEach(doc => {
            if (doc.data().address && doc.data().address.toLowerCase().includes('jewell')) {
                 console.log(`  -> Found Jewell in 'deals' here!`);
            }
        });
        pubDeals.forEach(doc => {
            if (doc.data().address && doc.data().address.toLowerCase().includes('jewell')) {
                 console.log(`  -> Found Jewell in 'publicDeals' here!`);
            }
        });
    }
}

findData().catch(console.error);
