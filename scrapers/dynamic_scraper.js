import { BaseScraper } from './base_scraper.js';
import puppeteer from 'puppeteer';

export class DynamicScraper extends BaseScraper {
    constructor(name, url) {
        super(name, url);
    }

    async fetchDynamic(url = this.url, waitSelector = null) {
        console.log(`[${this.name}] Launching browser for ${url}...`);
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        try {
            const page = await browser.newPage();
            await page.setUserAgent(this.headers['User-Agent']);
            
            console.log(`[${this.name}] Navigating to ${url}...`);
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

            if (waitSelector) {
                console.log(`[${this.name}] Waiting for selector ${waitSelector}...`);
                await page.waitForSelector(waitSelector, { timeout: 30000 });
            }

            const content = await page.content();
            return { content, page, browser };
        } catch (error) {
            console.error(`[${this.name}] Browser error: ${error.message}`);
            await browser.close();
            return null;
        }
    }
}
