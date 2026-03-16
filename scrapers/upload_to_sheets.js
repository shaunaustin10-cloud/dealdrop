import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Load service account credentials
const SERVICE_ACCOUNT_FILE = './service-account.json';
const SPREADSHEET_ID = '1jmlsK5efaLoULwoxP6NeGqcPoLm4LOvrGgBIc0o85fQ';

async function main() {
    try {
        let sa;
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            if (sa.private_key) {
                sa.private_key = sa.private_key.replace(/\\n/g, '\n');
            }
        } else if (fs.existsSync(SERVICE_ACCOUNT_FILE)) {
            const raw = fs.readFileSync(SERVICE_ACCOUNT_FILE, 'utf8');
            sa = JSON.parse(raw);
            if (sa.private_key) {
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

    } catch (error) {
        console.error('Error updating Google Sheets:', error.message);
        if (error.response && error.response.data) {
            console.error(error.response.data);
        }
    }
}

main();
