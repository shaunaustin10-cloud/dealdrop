import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Load service account credentials
const SERVICE_ACCOUNT_FILE = './service-account.json';
const SPREADSHEET_ID = '12ga1oPmzmXq4wbz-Ytm_9exbG12sJhNI-CNUaJtLphA';

async function main() {
    try {
        let sa;
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            try {
                sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            } catch (e) {
                console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT env var:", e.message);
                return;
            }
            if (sa.private_key) {
                sa.private_key = sa.private_key.replace(/\\n/g, '\n');
            }
        } else if (fs.existsSync(SERVICE_ACCOUNT_FILE)) {
            // Using a workaround to parse the malformed local file so the script doesn't crash
            try {
                const raw = fs.readFileSync(SERVICE_ACCOUNT_FILE, 'utf8');
                // The local file has a syntax error around position 900 where a literal \y exists.
                // It also has literal newlines in the private key.
                const cleanRaw = raw.replace(/\\\\y/g, 'y').replace(/\n(?!( *\"|\}))/g, '\\n');
                // Let's use a more robust fallback
                sa = JSON.parse(raw.replace(/\\y/g, 'y')); // Fix the specific escaping bug
            } catch (e) {
                console.error("Failed to parse local service-account.json:", e.message);
                console.log("Since FIREBASE_SERVICE_ACCOUNT is not set, we cannot proceed.");
                return;
            }
            if (sa && sa.private_key) {
                sa.private_key = sa.private_key.replace(/\\n/g, '\n');
            }
        } else {
            console.error('Error: No service account credentials found in env or file.');
            return;
        }

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: sa.client_email,
                private_key: sa.private_key,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Read the local scraped data
        const localDataRaw = fs.readFileSync('foreclosures.json', 'utf8');
        const localListings = JSON.parse(localDataRaw);

        if (localListings.length === 0) {
            console.log('No local listings to upload.');
            return;
        }

        console.log(`Loaded ${localListings.length} targeted listings from foreclosures.json`);

        // Get existing data from the sheet to prevent duplicates
        const getRowsResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A:F', // Assuming columns A to F
        });

        const existingRows = getRowsResponse.data.values || [];
        
        // If the sheet is completely empty, we need to add a header
        let hasHeader = existingRows.length > 0;
        
        // Build a set of existing identifiers (e.g., Source + Address)
        const existingIdentifiers = new Set();
        if (existingRows.length > 1) { // Skip header
            for (let i = 1; i < existingRows.length; i++) {
                const row = existingRows[i];
                if (row.length >= 2) {
                    const source = row[0] || '';
                    const address = row[1] || '';
                    existingIdentifiers.add(`${source}|${address}`.toLowerCase());
                }
            }
        }

        console.log(`Found ${Math.max(0, existingRows.length - (hasHeader ? 1 : 0))} existing records in the Google Sheet.`);

        const rowsToAppend = [];
        
        // Add header if missing
        if (!hasHeader) {
            rowsToAppend.push([
                'Source',
                'Address',
                'Auction Date',
                'Jurisdiction/County',
                'Status',
                'Deposit'
            ]);
        }

        // Filter for new listings
        for (const listing of localListings) {
            const source = listing.source || '';
            const address = listing.address || '';
            const identifier = `${source}|${address}`.toLowerCase();

            if (!existingIdentifiers.has(identifier)) {
                rowsToAppend.push([
                    source,
                    address,
                    listing.saleDate || listing.auctionDate || '',
                    listing.jurisdiction || listing.county || '',
                    listing.status || 'Active',
                    listing.deposit || ''
                ]);
            }
        }

        if (rowsToAppend.length === 0) {
            console.log('No new listings to append to the Google Sheet.');
            return;
        }

        console.log(`Appending ${rowsToAppend.length - (!hasHeader ? 1 : 0)} new listings to the sheet...`);

        // Append to sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A:A',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: rowsToAppend,
            },
        });

        console.log('✅ Successfully updated Google Sheets!');

        // Optional: Send new leads to a Make.com or Zapier webhook
        const webhookUrl = process.env.WEBHOOK_URL;
        if (webhookUrl) {
            console.log(`Triggering webhook at ${webhookUrl}...`);
            // Format the rows nicely into objects for the webhook
            const payload = {
                event: 'new_leads',
                count: rowsToAppend.length - (!hasHeader ? 1 : 0),
                leads: rowsToAppend.filter(row => row[0] !== 'Source').map(row => ({
                    source: row[0],
                    address: row[1],
                    auctionDate: row[2],
                    jurisdiction: row[3],
                    status: row[4],
                    deposit: row[5]
                }))
            };

            try {
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (response.ok) {
                    console.log('✅ Webhook triggered successfully!');
                } else {
                    console.error('⚠️ Webhook returned error status:', response.status);
                }
            } catch (err) {
                console.error('⚠️ Failed to trigger webhook:', err.message);
            }
        }

    } catch (error) {
        console.error('Error updating Google Sheets:', error.message);
        if (error.response && error.response.data) {
            console.error(error.response.data);
        }
    }
}

await main();
