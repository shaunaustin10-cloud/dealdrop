import { DynamicScraper } from '../dynamic_scraper.js';
import * as cheerio from 'cheerio';

export class OrlansScraper extends DynamicScraper {
    constructor() {
        super('Orlans', 'https://matlsales.orlans.com/Home/ForeclosureSales');
    }

    async scrape() {
        const result = await this.fetchDynamic(this.url);
        if (!result) return [];

        const { page, browser } = result;
        
        try {
            // Check if we are on the policy page
            if (page.url().includes('Policy/Index')) {
                console.log(`[${this.name}] Policy page detected. Accepting terms...`);
                // Find and click the accept button
                const buttons = await page.$$('button, input[type="submit"], a');
                for (const button of buttons) {
                    const text = await page.evaluate(el => el.textContent, button);
                    if (text.toLowerCase().includes('accept') || text.toLowerCase().includes('agree')) {
                        await button.click();
                        break;
                    }
                }
                await page.waitForNavigation({ waitUntil: 'networkidle2' });
            }

            console.log(`[${this.name}] Waiting for table...`);
            await page.waitForSelector('table', { timeout: 30000 });

            const content = await page.content();
            const $ = cheerio.load(content);
            const sales = [];

            $('table tbody tr').each((i, el) => {
                const cells = $(el).find('td');
                if (cells.length < 5) return;

                const state = $(cells[0]).text().trim();
                const county = $(cells[1]).text().trim();
                const saleDate = $(cells[2]).text().trim();
                const address = $(cells[3]).text().trim();
                const status = $(cells[4]).text().trim();

                if (address && state.toLowerCase().includes('va')) {
                    sales.push({
                        source: this.name,
                        state,
                        county,
                        saleDate,
                        address: this.parseAddress(address),
                        status
                    });
                }
            });

            await browser.close();
            console.log(`[${this.name}] Found ${sales.length} sales.`);
            return sales;
        } catch (error) {
            console.error(`[${this.name}] Browser error: ${error.message}`);
            await browser.close();
            return [];
        }
    }
}
