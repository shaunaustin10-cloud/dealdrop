import fs from 'fs';
const saPath = './scrapers/service-account.json';
const raw = fs.readFileSync(saPath, 'utf8').trim();
console.log('Raw length:', raw.length);
try {
    const sa = JSON.parse(raw);
    console.log('Keys:', Object.keys(sa));
    console.log('Private key starts with:', sa.private_key.substring(0, 50));
    console.log('Private key length:', sa.private_key.length);
} catch (e) {
    console.error('Error:', e.message);
    console.error('Error position:', e.at);
}
