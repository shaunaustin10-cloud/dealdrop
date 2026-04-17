import admin from 'firebase-admin';
import fs from 'fs';

const raw = fs.readFileSync('scrapers/service-account.json', 'utf8');
const sa = JSON.parse(raw);

// OpenSSL 3.0 (Node 18/20) is VERY picky. 
// It wants the key to be EXACTLY right.
let key = sa.private_key;

// 1. Convert to actual newlines if it's literal \n
key = key.replace(/\\n/g, '\n');

// 2. Remove any whitespace around existing newlines
key = key.split('\n').map(l => l.trim()).filter(l => l).join('\n');

// 3. Rebuild with proper markers
const header = '-----BEGIN PRIVATE KEY-----';
const footer = '-----END PRIVATE KEY-----';

if (!key.startsWith(header)) {
    // If it's just the base64, wrap it. 
    // But usually it should have the header. 
    // If it doesn't, we need to know where it came from.
}

sa.private_key = key;

console.log('Project:', sa.project_id);
admin.initializeApp({
    credential: admin.credential.cert(sa),
    projectId: sa.project_id
});

const db = admin.firestore();

async function check() {
    const appIds = ['default-app-id', 'dealdrop-prod', 'web-app-30504', '1:743890283978:web:5f27064ff3fad333e33333'];
    for (const id of appIds) {
        try {
            const snap = await db.collection('artifacts').doc(id).collection('publicDeals').limit(1).get();
            console.log(`App ID: ${id} -> publicDeals count: ${snap.size > 0 ? 'HAS DATA' : 'EMPTY'}`);
            if (snap.size > 0) {
                 const profiles = await db.collection('artifacts').doc(id).collection('profiles').get();
                 console.log(`  Profiles count: ${profiles.size}`);
            }
        } catch (e) {
            console.log(`App ID: ${id} -> Error: ${e.message}`);
        }
    }
}
check().catch(console.error);
