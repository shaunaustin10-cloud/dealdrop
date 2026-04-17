import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const saPath = path.join(__dirname, 'scrapers/service-account.json');
const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));

// Only replace if it contains literals
if (sa.private_key && sa.private_key.includes('\\n')) {
    sa.private_key = sa.private_key.replace(/\\n/g, '\n');
}

try {
    admin.initializeApp({
        credential: admin.credential.cert(sa),
        projectId: 'web-app-30504'
    });

    const db = admin.firestore();
    const snapshot = await db.collection('artifacts').doc('default-app-id').collection('foreclosureLeads').where('source', '==', 'VAPilot').get();
    console.log(`Live VAPilot leads: ${snapshot.size}`);
} catch (err) {
    console.error(err);
}
