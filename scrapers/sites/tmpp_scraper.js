import { BaseScraper } from '../base_scraper.js';
import * as cheerio from 'cheerio';

export class TMPPScraper extends BaseScraper {
    constructor() {
        super('TMMP', 'https://tmppllc.com/virginia_foreclosure_sales');
    }

    async scrape() {
        const html = await this.fetch();
        if (!html) return [];

        const $ = cheerio.load(html);
        const sales = [];

        $('table tbody tr').each((i, el) => {
            const cells = $(el).find('td');
            if (cells.length < 7) return;

            const jurisdiction = $(cells[0]).text().trim();
            const fileNumber = $(cells[1]).text().trim();
            const deposit = $(cells[2]).text().trim();
            const address = $(cells[3]).text().trim();
            const principal = $(cells[4]).text().trim();
            const saleDate = $(cells[5]).text().trim();
            const location = $(cells[6]).text().trim();

            if (address && address !== 'Property Address') {
                sales.push({
                    source: this.name,
                    jurisdiction,
                    fileNumber,
                    deposit,
                    address: this.parseAddress(address),
                    principal,
                    saleDate,
                    location
                });
            }
        });

        console.log(`[${this.name}] Found ${sales.length} sales.`);
        return sales;
    }
}
