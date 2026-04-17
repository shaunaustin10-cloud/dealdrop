import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const saPath = path.join(__dirname, 'scrapers/service-account.json');
const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));

if (sa.private_key && sa.private_key.includes('\\n')) {
    sa.private_key = sa.private_key.replace(/\\n/g, '\n');
}

try {
    admin.initializeApp({
        credential: admin.credential.cert(sa),
        projectId: 'web-app-30504'
    });

    const db = admin.firestore();
    
    const count1 = (await db.collection('artifacts').doc('default-app-id').collection('foreclosureLeads').get()).size;
    const count2 = (await db.collection('artifacts').doc('web-app-30504').collection('foreclosureLeads').get()).size;
    
    console.log(`Leads in 'default-app-id': ${count1}`);
    console.log(`Leads in 'web-app-30504': ${count2}`);
    
    // Check for VAPilot specifically in default-app-id
    const vaPilotCount = (await db.collection('artifacts').doc('default-app-id').collection('foreclosureLeads').where('source', '==', 'VAPilot').get()).size;
    console.log(`VAPilot in 'default-app-id': ${vaPilotCount}`);

} catch (err) {
    console.error(err);
}
