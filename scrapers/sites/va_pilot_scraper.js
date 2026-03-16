import { BaseScraper } from '../base_scraper.js';
import * as cheerio from 'cheerio';

export class VAPilotScraper extends BaseScraper {
    constructor() {
        super('VAPilot', 'https://classifieds.pilotonline.com/va/notices/search?search_type=advanced&ap_c=22796849&sort_by=date&order=desc');
    }

    async scrape() {
        const sales = [];
        // Scrape first 3 pages to get recent notices
        for (let page = 1; page <= 3; page++) {
            const url = `${this.url}&p=${page}`;
            const html = await this.fetch(url);
            if (!html) continue;

            const $ = cheerio.load(html);
            const items = $('.ap_ad_wrap');

            items.each((i, el) => {
                const title = $(el).find('.post-summary-title p.desktop').text().trim();
                const description = $(el).find('.post-copy.desktop').text().trim();
                const postedDate = $(el).find('.post-summary-date').text().trim();

                // Extract sale date from description
                // Examples: 
                // "public auction on 4/14/2026 at 3:00 PM"
                // "on April 15, 2026 at 11:15  AM"
                const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4}|\w+ \d{1,2}, \d{4})\s+at\s+\d{1,2}:\d{2}\s*[AP]M/i;
                const dateMatch = description.match(dateRegex);
                const saleDate = dateMatch ? dateMatch[0] : null;

                // Extract address from description
                // Usually the address is in the first few lines
                const lines = description.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                
                // Common pattern: 
                // Line 0: TRUSTEE'S SALE
                // Line 1: 123 Main St
                // Line 2: Norfolk, VA 23501
                
                let address = '';
                if (lines.length > 1) {
                    // Start from the first line that isn't just "TRUSTEE'S SALE"
                    let startLine = 0;
                    if (lines[0].toUpperCase().includes("TRUSTEE'S SALE") && lines.length > 1) {
                        startLine = 1;
                    }
                    
                    address = lines[startLine];
                    
                    // If the current address line doesn't have city/state/zip, and there's a next line, 
                    // and that next line DOES have city/state/zip, combine them.
                    if (!address.includes(', VA') && !address.match(/\d{5}/) && lines.length > startLine + 1) {
                        if (lines[startLine + 1].includes(', VA') || lines[startLine + 1].match(/\d{5}/)) {
                            address += ' ' + lines[startLine + 1];
                        }
                    }
                } else {
                    address = title;
                }

                // Final cleanup: if it still doesn't look like an address, search all lines
                if (!address.includes(', VA') && !address.match(/\d{5}/)) {
                    const addressLine = lines.find(l => l.includes(', VA') || l.match(/\d{5}/));
                    if (addressLine) {
                        address = addressLine;
                    }
                }

                // Only add if it looks like a trustee's sale or auction
                const searchStr = (title + ' ' + description).toUpperCase();
                if (searchStr.includes("TRUSTEE'S SALE") || searchStr.includes("AUCTION")) {
                    sales.push({
                        source: this.name,
                        title: title,
                        address: this.parseAddress(address),
                        saleDate: saleDate,
                        description: description.substring(0, 500) + '...',
                        postedDate: postedDate,
                        status: 'Active'
                    });
                }
            });

            console.log(`[${this.name}] Page ${page}: Found ${items.length} items.`);
            
            // Short delay to be nice to the server
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(`[${this.name}] Total found: ${sales.length} sales.`);
        return sales;
    }
}
