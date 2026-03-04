import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

export class BaseScraper {
    constructor(name, url) {
        this.name = name;
        this.url = url;
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        };
        this.agent = new https.Agent({
            rejectUnauthorized: false
        });
    }

    async fetch(url = this.url) {
        console.log(`[${this.name}] Fetching ${url}...`);
        try {
            const response = await axios.get(url, { 
                headers: this.headers,
                httpsAgent: this.agent
            });
            return response.data;
        } catch (error) {
            console.error(`[${this.name}] Error fetching ${url}: ${error.message}`);
            return null;
        }
    }

    async scrape() {
        throw new Error('Method scrape() must be implemented');
    }

    parseAddress(text) {
        if (!text) return null;
        return text.trim().replace(/\s+/g, ' ');
    }
}
