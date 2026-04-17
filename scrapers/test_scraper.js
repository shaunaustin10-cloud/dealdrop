import { VAPilotScraper } from './sites/va_pilot_scraper.js';

async function test() {
    console.log("Testing VAPilotScraper...");
    const scraper = new VAPilotScraper();
    try {
        const results = await scraper.scrape();
        console.log(`Success! Found ${results.length} results.`);
        if (results.length > 0) {
            console.log("First result:", JSON.stringify(results[0], null, 2));
        }
    } catch (error) {
        console.error("Scraper failed:", error);
    }
}

test();
