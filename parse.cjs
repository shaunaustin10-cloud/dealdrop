const fs = require('fs');

const excludedNames = [
    "pamela dunn",
    "pamela heater",
    "hilee taylor",
    "carlton rembert",
    "alisia",
    "drona trital",
    "gerard",
    "geoffrey",
    "rashad felton",
    "george pittman"
].map(n => n.toLowerCase());

function shouldExclude(name) {
    const lowerName = name.toLowerCase().trim();
    for (const ex of excludedNames) {
        if (lowerName.includes(ex)) {
            return true;
        }
    }
    return false;
}

const data = fs.readFileSync('raw_contacts.txt', 'utf-8');
const lines = data.split('\n').map(l => l.trim());
const contacts = [];

// We always include Shaun Austin
contacts.push("Shaun,Austin,shaunaustin10@gmail.com");

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for lines containing '@' but no spaces (likely an email)
    if (line.includes('@') && !line.includes(' ')) {
        const email = line;
        
        // Backtrack to find the name
        let name = '';
        for (let j = i - 1; j >= Math.max(0, i - 4); j--) {
            // Ignore lines that are metadata, phone numbers (start with parenthesis), empty lines, etc.
            if (lines[j] && 
                !lines[j].includes('Investor') && 
                !lines[j].includes('Buyer') && 
                !lines[j].includes('New') && 
                !lines[j].includes('Working') && 
                !lines[j].includes('Disclosed') && 
                !lines[j].includes('Unqualified') && 
                !lines[j].startsWith('(') && 
                !lines[j].includes('*')) {
                name = lines[j];
                break;
            }
        }
        
        if (name && !shouldExclude(name)) {
            let parts = name.split(' ');
            let firstName = parts[0] || '';
            let lastName = parts.slice(1).join(' ') || '';
            
            // Cleanup quotes/commas just in case
            firstName = firstName.replace(/,/g, '');
            lastName = lastName.replace(/,/g, '');
            
            contacts.push(`${firstName},${lastName},${email}`);
        }
    }
}

// Remove duplicates just in case
const uniqueContacts = [...new Set(contacts)];

const csvContent = "First Name,Last Name,Email Address\n" + uniqueContacts.join("\n");
fs.writeFileSync('email_list.csv', csvContent);
console.log("Wrote " + uniqueContacts.length + " contacts to email_list.csv");
