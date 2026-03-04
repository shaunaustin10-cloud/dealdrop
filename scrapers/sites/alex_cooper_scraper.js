import { BaseScraper } from '../base_scraper.js';
import * as cheerio from 'cheerio';

export class AlexCooperScraper extends BaseScraper {
    constructor() {
        super('AlexCooper', 'https://realestate.alexcooper.com/foreclosures');
    }

    async scrape() {
        const html = await this.fetch();
        if (!html) return [];

        const $ = cheerio.load(html);
        const sales = [];

        // Alex Cooper stores data in a script tag with viewVars
        const scripts = $('script');
        let data = null;

        scripts.each((i, el) => {
            const content = $(el).html();
            if (content && content.includes('viewVars =')) {
                console.log(`[${this.name}] Found viewVars script tag.`);
                try {
                    const startIdx = content.indexOf('viewVars =') + 'viewVars ='.length;
                    const endIdx = content.lastIndexOf('};') + 1;
                    const jsonStr = content.substring(startIdx, endIdx).trim();
                    console.log(`[${this.name}] jsonStr length: ${jsonStr.length}`);
                    data = JSON.parse(jsonStr);
                    console.log(`[${this.name}] Successfully parsed JSON. Keys: ${Object.keys(data)}`);
                } catch (e) {
                    console.error(`[${this.name}] Error parsing viewVars JSON:`, e.message);
                }
            }
        });

        const lotsData = data.lots || (data.upcomingLots && data.upcomingLots.result_page) || [];
        const lotsArray = Array.isArray(lotsData) ? lotsData : (lotsData.result_page || []);

        lotsArray.forEach(lot => {
            const addr = lot.address || {};
            const addressStr = `${addr.address_line_one || ''}, ${addr.city || ''}, ${addr.state || addr.region || ''} ${addr.postal_code || ''}`.replace(/, ,/g, ',').trim();
            
            sales.push({
                source: this.name,
                caseNumber: lot.row_id,
                saleDate: lot.auction ? lot.auction.time_start : null,
                address: this.parseAddress(addressStr),
                city: addr.city,
                state: addr.state || addr.region,
                zip: addr.postal_code,
                deposit: lot.deposit_amount,
                status: lot.status,
                title: lot.title
            });
        });

        console.log(`[${this.name}] Found ${sales.length} sales.`);
        return sales;
    }
}
