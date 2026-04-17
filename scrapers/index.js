import { TMPPScraper } from './sites/tmpp_scraper.js';
import { RosenbergScraper } from './sites/rosenberg_scraper.js';
import { AlexCooperScraper } from './sites/alex_cooper_scraper.js';
import { TidewaterScraper } from './sites/tidewater_scraper.js';
import { GlasserScraper } from './sites/glasser_scraper.js';
import { BrockAndScottScraper } from './sites/brock_scott_scraper.js';
import { OrlansScraper } from './sites/orlans_scraper.js';
import { VAPilotScraper } from './sites/va_pilot_scraper.js';
import fs from 'fs';

async function main() {
    const scrapers = [
        new TMPPScraper(),
        new RosenbergScraper(),
        new AlexCooperScraper(),
        new TidewaterScraper(),
        new GlasserScraper(),
        new BrockAndScottScraper(),
        new OrlansScraper(),
        new VAPilotScraper(),
    ];

    let allSales = [];
    for (const scraper of scrapers) {
        try {
            const sales = await scraper.scrape();
            allSales = allSales.concat(sales);
        } catch (error) {
            console.error(`Error running scraper ${scraper.name}:`, error);
        }
    }

    // Clean up addresses, remove duplicates, and filter for Targeted VA Areas
    const targetedSales = [];
    const seenAddresses = new Set();

    const hamptonRoads = ['VIRGINIA BEACH', 'NORFOLK', 'CHESAPEAKE', 'NEWPORT NEWS', 'HAMPTON', 'PORTSMOUTH', 'SUFFOLK', 'ISLE OF WIGHT', 'JAMES CITY', 'YORK', 'POQUOSON', 'WILLIAMSBURG', 'SMITHFIELD', 'FRANKLIN', 'GLOUCESTER'];
    const richmondArea = ['RICHMOND', 'HENRICO', 'CHESTERFIELD', 'HANOVER', 'HOPEWELL', 'COLONIAL HEIGHTS', 'PETERSBURG', 'POWHATAN', 'GOOCHLAND', 'DINWIDDIE'];
    
    const targetedAreas = [...hamptonRoads, ...richmondArea];

    allSales.forEach(sale => {
        if (!sale.address) return;
        
        const addrUpper = sale.address.toUpperCase();
        const jurUpper = (sale.jurisdiction || sale.county || '').toUpperCase();
        
        // Check if it's in our targeted areas
        const isInTargetArea = targetedAreas.some(city => 
            addrUpper.includes(city) || jurUpper.includes(city)
        );

        if (!isInTargetArea) return;

        const normalizedAddr = sale.address.toLowerCase().trim();
        if (!seenAddresses.has(normalizedAddr)) {
            seenAddresses.add(normalizedAddr);
            targetedSales.push(sale);
        }
    });

    console.log(`\n--- Total Unique Targeted (Hampton Roads/Richmond) Sales Found: ${targetedSales.length} ---`);
    
    const summary = targetedSales.reduce((acc, sale) => {
        acc[sale.source] = (acc[sale.source] || 0) + 1;
        return acc;
    }, {});
    console.log("Summary by Source:", summary);

    // Save to JSON
    fs.writeFileSync('foreclosures.json', JSON.stringify(targetedSales, null, 2));
    
    // Save to CSV for Google Sheets
    const csvHeader = 'Source,Address,Auction Date,Jurisdiction/County,Status\n';
    const csvRows = targetedSales.map(sale => {
        const source = `"${(sale.source || '').replace(/"/g, '""')}"`;
        const address = `"${(sale.address || '').replace(/"/g, '""')}"`;
        const date = `"${(sale.saleDate || '').replace(/"/g, '""')}"`;
        const jurisdiction = `"${(sale.jurisdiction || sale.county || '').replace(/"/g, '""')}"`;
        const status = `"${(sale.status || 'Active').replace(/"/g, '""')}"`;
        
        return `${source},${address},${date},${jurisdiction},${status}`;
    }).join('\n');

    fs.writeFileSync('foreclosures.csv', csvHeader + csvRows);

    console.log("Results saved to:");
    console.log(" - scrapers/foreclosures.json");
    console.log(" - scrapers/foreclosures.csv (Perfect for Google Sheets)");

    console.log("\nStarting Google Sheets upload...");
    await import('./upload_to_sheets.js');

    // Auto-trigger upload if requested (optional)
    console.log("\nStarting Firestore upload...");
    await import('./upload_to_firestore.js');
}

main();
