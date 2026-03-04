import { DynamicScraper } from '../dynamic_scraper.js';
import * as cheerio from 'cheerio';

export class BrockAndScottScraper extends DynamicScraper {
    constructor() {
        super('BrockAndScott', 'https://www.brockandscott.com/foreclosure-sales/?_sft_state=virginia');
    }

    async scrape() {
        const result = await this.fetchDynamic(this.url, '.search-filter-results');
        if (!result) return [];

        const { content, browser } = result;
        const $ = cheerio.load(content);
        const sales = [];

        $('.search-filter-results .post').each((i, el) => {
            const title = $(el).find('.entry-title').text().trim();
            const address = $(el).find('.entry-content').text().trim();
            // Brock & Scott often has address in title or content
            
            if (title || address) {
                sales.push({
                    source: this.name,
                    title,
                    address: this.parseAddress(address || title),
                    link: $(el).find('a').attr('href')
                });
            }
        });

        await browser.close();
        console.log(`[${this.name}] Found ${sales.length} sales.`);
        return sales;
    }
}
