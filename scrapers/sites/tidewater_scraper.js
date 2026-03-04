import { BaseScraper } from '../base_scraper.js';
import * as cheerio from 'cheerio';

export class TidewaterScraper extends BaseScraper {
    constructor() {
        super('Tidewater', 'https://www.tidewaterauctions.com/upcoming-real-estate-auctions');
    }

    async scrape() {
        const html = await this.fetch();
        if (!html) return [];

        const $ = cheerio.load(html);
        const sales = [];

        $('.us-block').each((i, block) => {
            const date = $(block).find('.us-date span').text().trim();
            const county = $(block).find('.us-countyname span').text().trim();

            $(block).find('.us-sale-item').each((j, item) => {
                if ($(item).hasClass('us-sale-header')) return;

                const time = $(item).find('.us-sale-time span').text().trim();
                const address = $(item).find('.us-sale-address span').text().trim();
                const deposit = $(item).find('.us-sale-deposit span').text().trim();
                const client = $(item).find('.us-sale-client span').text().trim();
                const cancelled = $(item).find('input[type="hidden"]').val() === '1';

                if (address) {
                    sales.push({
                        source: this.name,
                        saleDate: date,
                        saleTime: time,
                        address: this.parseAddress(address),
                        county,
                        deposit,
                        client,
                        status: cancelled ? 'Cancelled' : 'Active'
                    });
                }
            });
        });

        console.log(`[${this.name}] Found ${sales.length} sales.`);
        return sales;
    }
}
