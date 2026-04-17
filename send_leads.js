import dotenv from 'dotenv';
import telnyx from 'telnyx';
import fs from 'fs';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';

// 1. Setup environment variables
dotenv.config();

const TELNYX_API_KEY = process.env.TELNYX_API_KEY;
const TELNYX_FROM_PHONE = process.env.TELNYX_PHONE_NUMBER;

if (!TELNYX_API_KEY || !TELNYX_FROM_PHONE) {
    console.error('❌ Error: TELNYX_API_KEY or TELNYX_PHONE_NUMBER missing from .env');
    process.exit(1);
}

const telnyxClient = new telnyx(TELNYX_API_KEY);
const LOG_FILE = 'sent_log.csv';

// Setup CSV Writer for the log
const csvWriter = createObjectCsvWriter({
    path: LOG_FILE,
    header: [
        { id: 'name', title: 'NAME' },
        { id: 'phone', title: 'PHONE' },
        { id: 'status', title: 'STATUS' },
        { id: 'timestamp', title: 'TIMESTAMP' }
    ],
    append: fs.existsSync(LOG_FILE)
});

/**
 * Formats a phone number to E.164 format (+1XXXXXXXXXX)
 */
function formatPhoneNumber(phone) {
    if (!phone) return null;
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) return `+1${cleaned}`;
    if (cleaned.length === 11 && cleaned.startsWith('1')) return `+${cleaned}`;
    if (phone.startsWith('+1') && phone.length === 12) return phone;
    return null;
}

/**
 * Loads the list of already sent phone numbers
 */
function getSentNumbers() {
    if (!fs.existsSync(LOG_FILE)) return new Set();
    const content = fs.readFileSync(LOG_FILE, 'utf-8');
    const lines = content.split('\n');
    const sent = new Set();
    // Skip header and get phone numbers from column 2
    for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts[1]) sent.add(parts[1].trim());
    }
    return sent;
}

/**
 * Sends a single SMS to a lead.
 */
async function sendSms(lead) {
    const { name, phone, address, note } = lead;
    const formattedPhone = formatPhoneNumber(phone);

    if (!formattedPhone) {
        console.error(`⚠️ Skipping ${name} - Invalid phone number: ${phone}`);
        return;
    }

    // CUSTOMIZE YOUR MESSAGE HERE:
    // This will include the "note" from your CSV if it exists.
    const customNote = note ? ` ${note}.` : '';
    const messageText = `Hi ${name}, this is Shaun Austin.${customNote} I'm interested in your property at ${address}. Do you have a moment to chat? Reply STOP to opt out.`;

    try {
        const response = await telnyxClient.messages.send({
            from: TELNYX_FROM_PHONE,
            to: formattedPhone,
            text: messageText,
        });
        
        console.log(`✅ Sent to ${name} (${formattedPhone}): Status ${response.data.to[0].status}`);
        
        // Log the success
        await csvWriter.writeRecords([{
            name: name,
            phone: formattedPhone,
            status: 'SENT',
            timestamp: new Date().toISOString()
        }]);

    } catch (error) {
        console.error(`❌ Failed to send to ${name} (${formattedPhone}):`, error.message);
        
        // Log the failure
        await csvWriter.writeRecords([{
            name: name,
            phone: formattedPhone,
            status: `FAILED: ${error.message}`,
            timestamp: new Date().toISOString()
        }]);
    }
}

/**
 * Processes the leads
 */
async function processLeads() {
    const leads = [];
    const sentNumbers = getSentNumbers();

    if (!fs.existsSync('leads.csv')) {
        console.error('❌ Error: leads.csv not found.');
        return;
    }

    fs.createReadStream('leads.csv')
        .pipe(csv())
        .on('data', (data) => leads.push(data))
        .on('end', async () => {
            console.log(`📋 Found ${leads.length} leads in CSV.`);
            
            let count = 0;
            for (const lead of leads) {
                const formatted = formatPhoneNumber(lead.phone);
                
                // SKIP if already sent
                if (sentNumbers.has(formatted)) {
                    console.log(`⏭️  Skipping ${lead.name} - Already sent previously.`);
                    continue;
                }

                await sendSms(lead);
                count++;
                
                // Safety Delay
                console.log('⏳ Waiting 2 seconds...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            console.log(`🚀 Automation complete! Sent ${count} new messages.`);
        });
}

processLeads();
