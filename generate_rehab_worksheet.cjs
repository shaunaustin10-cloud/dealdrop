const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node generate_rehab_worksheet.js "<Address>" <SqFootage>');
  process.exit(1);
}

const address = args[0];
const sqft = parseInt(args[1], 10);

if (isNaN(sqft)) {
  console.log('Error: SqFootage must be a number.');
  process.exit(1);
}

// Format address for filename
const formattedAddress = address.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
const outputPath = path.join(__dirname, `${formattedAddress}_Rehab_Estimator.csv`);

// Read the base template
const templatePath = path.join(__dirname, '407_Pine_Ave_Rehab_Estimator.csv');
if (!fs.existsSync(templatePath)) {
  console.log(`Error: Template file not found at ${templatePath}`);
  process.exit(1);
}

const csvContent = fs.readFileSync(templatePath, 'utf-8');
const lines = csvContent.split('\n');

let subtotal = 0;
let updatedLines = [];
let contingencyRowIndex = -1;
let contingencyPercent = 12;

// The template has Qty 734 in some places. We will replace this with the new sqft.
// Also we'll calculate new totals.

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  if (i === 0) {
    updatedLines.push(line);
    continue;
  }

  // Parse CSV line handling quotes simply (since no nested quotes or complex commas)
  // Actually, some rows have commas inside quotes, e.g., "Fireplace/chimney, brick/stone - replace existing"
  // Let's use a regex to split by comma outside quotes
  const parts = [];
  let current = '';
  let inQuotes = false;
  for (let char of line) {
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current);

  // parts: [Category, Y/N, Repair Type, Qty, Unit, Unit Cost, Total]
  if (parts.length >= 7) {
    let qty = parts[3];
    let unitCostStr = parts[5].replace('$', '');
    let unitCost = parseFloat(unitCostStr);
    
    // Check if it's the contingency row
    if (parts[0] === 'Contingency' && parts[4] === '%') {
      contingencyRowIndex = updatedLines.length; // We'll calculate its total later
      contingencyPercent = parseFloat(parts[3]) || 12;
      updatedLines.push(line); // temporary placeholder
      continue;
    }

    if (qty === '734' || (qty === '' && false)) { 
        // We only replace the exact matching template sqft for safety, or we can replace any sf/psf unit if needed.
        // The original template only had '734' for Roof, Painting, and Laminate flooring. 
        // We will just replace '734' with the new sqft.
    }
    
    // Replace 734 with new sqft
    if (qty === '734') {
        qty = sqft.toString();
        parts[3] = qty;
    }

    // Recalculate total if Qty and Unit Cost exist
    if (qty && !isNaN(parseFloat(qty)) && !isNaN(unitCost)) {
      const total = parseFloat(qty) * unitCost;
      parts[6] = `$${total.toFixed(2)}`;
      subtotal += total;
    } else {
      // If there's an existing Total but no Qty recalculation, we still need to add it to subtotal
      const existingTotalStr = parts[6].replace('$', '');
      const existingTotal = parseFloat(existingTotalStr);
      if (!isNaN(existingTotal)) {
        subtotal += existingTotal;
      }
    }

    // Reconstruct line
    updatedLines.push(parts.map(p => p.includes(',') ? `"${p}"` : p).join(','));
  } else {
    updatedLines.push(line);
  }
}

// Calculate Contingency
if (contingencyRowIndex !== -1) {
    const contingencyTotal = subtotal * (contingencyPercent / 100);
    const parts = updatedLines[contingencyRowIndex].split(',');
    // Wait, split won't work perfectly if quotes are there, but Contingency row doesn't have commas in text
    // "Contingency,,Misc Contingency Cost (10-20% depending on unknowns),12,%,$31425.00,$3771.00"
    // Note: $31425 was the subtotal in the template.
    // Let's rebuild the Contingency line.
    
    // Find the row
    const line = lines.find(l => l.startsWith('Contingency'));
    const p = [];
    let current = '';
    let inQuotes = false;
    for (let char of line) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
            p.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    p.push(current);
    
    p[5] = `$${subtotal.toFixed(2)}`;
    p[6] = `$${contingencyTotal.toFixed(2)}`;
    
    updatedLines[contingencyRowIndex] = p.map(x => x.includes(',') ? `"${x}"` : x).join(',');
    subtotal += contingencyTotal;
}

// Add a Grand Total row at the end
updatedLines.push(`Grand Total,,,,,,$${subtotal.toFixed(2)}`);

fs.writeFileSync(outputPath, updatedLines.join('\n'));
console.log(`Successfully created: ${outputPath}`);
console.log(`Estimated Total Rehab Cost: $${subtotal.toFixed(2)}`);
