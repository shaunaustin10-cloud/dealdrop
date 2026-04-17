import fs from 'fs';
const saPath = './scrapers/service-account.json';
let raw = fs.readFileSync(saPath, 'utf8');

// The file has literal newlines where it should have \n escapes
// Let's replace actual newlines that are followed by characters that belong in the key
// or just replace all internal newlines within the private_key value.

// Actually, simpler: just join everything that's inside the private_key quotes.
// But first, let's just replace all literal newlines with \n if they are between the start and end of the key value.

const startMarker = '"private_key": "';
const endMarker = '",\n  "client_email"';

const startIndex = raw.indexOf(startMarker);
const endIndex = raw.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const head = raw.substring(0, startIndex + startMarker.length);
    const body = raw.substring(startIndex + startMarker.length, endIndex);
    const tail = raw.substring(endIndex);
    
    // In the body, replace literal newlines (0x0A) with literal \n (0x5C 0x6E)
    // and replace invalid \y escapes with just y
    const fixedBody = body.replace(/\n/g, '\\n').replace(/\\y/g, 'y');
    
    const fixedRaw = head + fixedBody + tail;
    fs.writeFileSync(saPath, fixedRaw);
    console.log('Fixed service-account.json');
} else {
    console.error('Could not find markers');
}
