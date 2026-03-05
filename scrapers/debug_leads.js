import admin from 'firebase-admin';

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8081';
admin.initializeApp({ projectId: 'web-app-30504' });

const db = admin.firestore();

async function checkLeads() {
    const leads = await db.collection('artifacts').doc('dealdrop-prod').collection('foreclosureLeads').limit(5).get();
    console.log(`Found ${leads.size} leads in dealdrop-prod.`);
}

checkLeads().catch(console.error);
