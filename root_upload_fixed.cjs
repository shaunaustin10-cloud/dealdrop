
const admin = require('firebase-admin');
const fs = require('fs');

const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDBZmzKjpnkF5E/
5nPqxjL/Y3a9RI8zSROCjcmsnOF74ihRrOkBOHhUeukaJ8AeSv0sagjbhRBItXNT
cjhvqiXAtOMHmmUA+PQJrYUuB4Jha1IfnPvB/3DPYJ4784bOPogT0tva1mrS2r5E
1WerkFvdygbtaap3ewwxJnNHWleGXJrMlwqtnqYGXeLNWaq0gOV8rhCUz6ZiNSlq
QN7IuQUMPLXpNjDc8bzKCzK8Dw38xr2ShfB65ZXLExGf9Dk0U0mErbcmU1LtN8rm
BgMyrm/BQ/gi6eG0gav8KAZJY9eXpimR4nRM0aDMQClXpAuUqqEbnlhT0Lka2MuW
aRCtDF5ZAgMBAAECggEAKh0irY0V57xWDcMiFMqqCkDfd2F5iWJtVC2J8AONekuK
Ghb7+h8Q3NyS6/Yh+La9oLFKUnsMS7jvbwldTruPUwJQubQeMHMFuSHG8XoDIzGa
hXXKwLjeGNpiOo3SGhE10pNE+sdcJaQqcJTD6XEbABXhIkuzKidqRT2pNq1uh7w7
tIKicktM2RItcGLKSERwCr4LekVxHfc8rgCMUd6YJA8VCM1ysEQLnXfQSlyXZl1A
3i4TNroL7TSDTllB/HaOcSomDwxZS9c+hK2KNuNT0ZuQzSfML6XsiN4iglVDQXlQ
ynAf2/KbDxh0tN0favQVg3q6np+SlX5YV7Yzf/XJzQKBgQDgH7hoJqEYT8ciCvgm
T87G9GBr1cB3AL8KAL7xfZj9yiF09IMK2LcjGV+RBArSEGuxLvwx/lrhhRKv3c6x
SbOuaKxMkzIkOm7FM1bs4/rNgR8NnqJ06tCkxl0xk/vYrU02VuUiKuNfQBGlbu0q
TL+DQws3ZXVC/k70eAgMp6QeTwKBgQDc6A+AA9QvVQ6SpbYMmWLX9ZCjyjfvMITW
r214pmXKeJBM9XHOyW5tP088JeRO0DLO5+g4DyFgLGChbK12cw3EjWJQ4h+UZ/jb
lHBJVbAfhB/HQTJAXTvHbLU56Lt4iwMcGURHtYCP6IB2N1wWnFPwz3CPNeR4w+NE
PMZh2rn21wKBgQDQVawdZIsrBj2dL4UsV9NmrZNTqgaWmGL88WSNJqsoftRK219U
nnc7fGZ70NkW4rvrsYTidYEsqh4CvagfQVSppXXOMWuepNYfyV57d5a4liXlMN8Hb
3MrF4H6Qr3bUG4RCltO3xxZEXFIK7eoX/++mHJQ4kl9GPw81wL36xXqRkQKBgQCD
NH3ITf3f4wgVx8C5+PyBQkQXVEsmkM3FaUp+52379OHYI8vlwzQIRRr9oY/Z08Tp
qUn+ydXL9m+qUQ8yFCHwRP1JBxU0oxBm8uJCXFeQUHxDb5C2M+oGh6WX8Igwj3hY
XxVz9fSXBMQP8s+KSm180OiM1riNleNNKz+07SGY3wKBgHRvjJOjtPXI5d6Bwgmp
Ckha33d9PILuRTFkCtlfGYxDevl0uC6ilUrRomrCwICyNjbCy+abFFOxAF6sVdw3
CqrMsc/fXnxy3/Gmk05TGRbOADgU6ymlRPYUeJ4wZRRk19DL8nlugJ95Uw8OnCm
KZ2MJZFVOBtUv4+86Ov9e9Gv
-----END PRIVATE KEY-----`;

const sa = {
  "type": "service_account",
  "project_id": "web-app-30504",
  "private_key_id": "0116c1349e151a0b7a5130dbb40e87e28d4f6e73",
  "private_key": privateKey,
  "client_email": "firebase-adminsdk-fbsvc@web-app-30504.iam.gserviceaccount.com",
  "client_id": "113421053664554934227",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40web-app-30504.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

admin.initializeApp({
  credential: admin.credential.cert(sa),
  projectId: sa.project_id
});

const db = admin.firestore();
const appId = 'dealdrop-prod';
const leads = JSON.parse(fs.readFileSync('scrapers/foreclosures.json', 'utf8'));

console.log(`Uploading ${leads.length} leads...`);

async function upload() {
  const batch = db.batch();
  const leadsRef = db.collection('artifacts').doc(appId).collection('foreclosureLeads');
  
  leads.forEach(lead => {
    const docId = lead.address.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const ref = leadsRef.doc(docId);
    batch.set(ref, {
      ...lead,
      status: lead.status || 'new',
      dateAdded: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  });

  await batch.commit();
  console.log('✅ Upload finished.');
}

upload().catch(console.error);
