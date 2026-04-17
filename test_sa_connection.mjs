import admin from 'firebase-admin';
import fs from 'fs';

const saPath = './scrapers/service-account.json';
const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));

let key = sa.private_key;
// Ensure key has the correct header/footer and only actual newlines
if (!key.includes('-----BEGIN PRIVATE KEY-----')) {
    key = `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----`;
}

// Replace literal \n with actual newlines if present
key = key.replace(/\\n/g, '\n');

// Ensure only actual newlines (0x0A) exist as separators
key = key.split('\n').map(line => line.trim()).filter(line => line).join('\n');

// Add back header/footer correctly if join stripped them or made them weird
if (!key.startsWith('-----BEGIN PRIVATE KEY-----')) {
    key = '-----BEGIN PRIVATE KEY-----\n' + key;
}
if (!key.endsWith('-----END PRIVATE KEY-----')) {
    key = key + '\n-----END PRIVATE KEY-----';
}

sa.private_key = key;

console.log('Testing key format...');
try {
    admin.initializeApp({
        credential: admin.credential.cert(sa),
        projectId: sa.project_id || 'web-app-30504'
    });
    console.log('Success! Connection initialized.');
    
    const db = admin.firestore();
    const artifactsRef = db.collection('artifacts');
    const docs = await artifactsRef.listDocuments();
    
    for (const doc of docs) {
        console.log(`\nFound App ID Document: ${doc.id}`);
        const subcols = await doc.listCollections();
        for (const subcol of subcols) {
            const count = (await subcol.count().get()).data().count;
            console.log(`  - Subcollection: ${subcol.id} (count: ${count})`);
        }
    }
} catch (e) {
    console.error('Error:', e.message);
    if (e.stack) console.error(e.stack);
}
