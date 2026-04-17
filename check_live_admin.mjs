import 'dotenv/config';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initializeApp() {
    const saPath = path.join(__dirname, 'scrapers', 'service-account.json');
    if (fs.existsSync(saPath)) {
        console.log("Using service-account.json file...");
        let raw = fs.readFileSync(saPath, 'utf8');
        let sa;
        try {
            // First fix any unescaped newlines in the raw string, then parse
            // Typically private_key contains actual newlines which breaks JSON.
            // Replace literal newline characters inside strings with \n.
            // An easy hack is to regex replace any newline that isn't preceded by a comma or { or [
            // Or just fix the common issue: literal newlines inside the private_key value.
            raw = raw.replace(/\n/g, "\\n"); // escape all newlines
            // but this breaks the JSON structure because structural newlines get escaped.
            // Let's just strip structural newlines.
            const stripped = fs.readFileSync(saPath, 'utf8').split('\n').map(l => l.trim()).join('');
            // If there's an issue with \n inside the string, the above might not fix it.
            // Let's use eval as a fallback since JS object literals tolerate some things JSON doesn't.
        } catch (err) {}

        // Alternative safe parsing via eval:
        try {
            const fileContent = fs.readFileSync(saPath, 'utf8');
            sa = (new Function("return " + fileContent))();
        } catch (e) {
             console.error("Eval parse failed:", e);
             return false;
        }
        
        if (sa.private_key) {
            sa.private_key = sa.private_key.replace(/\\n/g, '\n');
        }
        admin.initializeApp({
            credential: admin.credential.cert(sa),
            projectId: sa.project_id || 'web-app-30504'
        });
        return true;
    }
    console.error("No service account found");
    return false;
}

const appId = process.env.VITE_APP_ID || 'default-app-id';

async function checkCollections() {
    const initialized = await initializeApp();
    if (!initialized) return;

    const db = admin.firestore();
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

checkCollections().catch(console.error);
