import { BaseScraper } from '../base_scraper.js';
import * as cheerio from 'cheerio';

export class RosenbergScraper extends BaseScraper {
    constructor() {
        super('Rosenberg', 'https://www.rosenberg-assoc.com/foreclosure-sales/');
    }

    async scrape() {
        const html = await this.fetch();
        if (!html) return [];

        const $ = cheerio.load(html);
        const sales = [];

        // Rosenberg uses a table with id="table_1"
        $('table#table_1 tbody tr').each((i, el) => {
            const cells = $(el).find('td');
            if (cells.length < 9) return;

            const caseNumber = $(cells[0]).text().trim();
            const saleDate = $(cells[1]).text().trim();
            const saleTime = $(cells[2]).text().trim();
            const address = $(cells[3]).text().trim();
            const city = $(cells[4]).text().trim();
            const jurisdiction = $(cells[5]).text().trim();
            const state = $(cells[6]).text().trim();
            const zip = $(cells[7]).text().trim();
            const deposit = $(cells[8]).text().trim();
            const cancelled = $(cells[10]).text().trim();

            if (address && address !== 'Property Address') {
                sales.push({
                    source: this.name,
                    caseNumber,
                    saleDate,
                    saleTime,
                    address: this.parseAddress(address),
                    city,
                    jurisdiction,
                    state,
                    zip,
                    deposit,
                    status: cancelled === 'Y' ? 'Cancelled' : 'Active'
                });
            }
        });

        console.log(`[${this.name}] Found ${sales.length} sales.`);
        return sales;
    }
}
