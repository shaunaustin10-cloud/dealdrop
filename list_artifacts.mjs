import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const saPath = path.join(__dirname, 'scrapers', 'service-account.json');

if (!fs.existsSync(saPath)) {
    console.error("service-account.json not found in scrapers/");
    process.exit(1);
}

let sa;
try {
    const raw = fs.readFileSync(saPath, 'utf8').trim();
    try {
        sa = JSON.parse(raw);
    } catch (err) {
        // Try with workaround for local file malformations
        sa = JSON.parse(raw.replace(/\\y/g, 'y').replace(/\n(?!( *\"|\}))/g, '\\n'));
    }
    
    // Fix private key formatting for Node 18+ / OpenSSL 3.0
    if (sa.private_key) {
        let key = sa.private_key.replace(/\\n/g, '\n');
        key = key.split('\n').map(line => line.trim()).filter(line => line).join('\n');
        if (!key.startsWith('-----BEGIN PRIVATE KEY-----')) {
            key = '-----BEGIN PRIVATE KEY-----\n' + key;
        }
        if (!key.endsWith('-----END PRIVATE KEY-----')) {
            key = key + '\n-----END PRIVATE KEY-----';
        }
        sa.private_key = key;
    }
} catch (e) {
    console.error("Failed to parse service-account.json:", e.message);
    process.exit(1);
}
admin.initializeApp({
    credential: admin.credential.cert(sa),
    projectId: sa.project_id || 'web-app-30504'
});

const db = admin.firestore();

async function listRootCollections() {
    console.log("Listing all root collections...");
    const collections = await db.listCollections();
    for (const col of collections) {
        const count = (await col.count().get()).data().count;
        console.log(`- Root Collection: ${col.id} (count: ${count})`);
        
        if (col.id === 'artifacts') {
            const docs = await col.listDocuments();
            for (const doc of docs) {
                console.log(`  - Artifact App ID: ${doc.id}`);
                const subcols = await doc.listCollections();
                for (const subcol of subcols) {
                    const scount = (await subcol.count().get()).data().count;
                    console.log(`    - Subcollection: ${subcol.id} (count: ${scount})`);
                }
            }
        }
    }
}

listRootCollections().catch(console.error);
