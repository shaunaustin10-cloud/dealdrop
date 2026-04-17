import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const saPath = path.join(__dirname, 'scrapers/service-account.json');
const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
if (sa.private_key) {
    console.log("Before replacement:", sa.private_key.length);
    sa.private_key = sa.private_key.replace(/\\n/g, '\n');
    console.log("After replacement: ", sa.private_key.length);
}

admin.initializeApp({
    credential: admin.credential.cert(sa),
    projectId: 'web-app-30504'
});

const db = admin.firestore();
const appId = 'default-app-id';

async function checkLeads() {
    const leadsRef = db.collection('artifacts').doc(appId).collection('foreclosureLeads');
    const snapshot = await leadsRef.where('source', '==', 'VAPilot').get();

    console.log(`Found ${snapshot.size} VAPilot leads in live Firestore.`);
    if (snapshot.size > 0) {
        snapshot.docs.slice(0, 5).forEach(doc => {
            const data = doc.data();
            console.log(`- ${data.address} | Sale Date: ${data.saleDate} | Status: ${data.status} | UpdatedAt: ${data.updatedAt?.toDate()}`);
        });
    }
}

checkLeads().catch(console.error);
