const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeATGL() {
    try {
        const url = 'https://stockcharts.com/public/1107832';
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(response.data);
        
        const bodyText = $('body').text();
        
        let inGreenZone = [];
        let approaching = [];

        // 1. Find the "Approaching / Soon" list
        // Example: "Soon for SLV REMX COPX AA & more"
        const soonMatch = bodyText.match(/Soon for ([A-Z\s]+)(?:&|and)/i);
        if (soonMatch && soonMatch[1]) {
            approaching = soonMatch[1].trim().split(/\s+/);
        }

        // 2. Find charts explicitly in the Green Zone
        // Let's use the regex to find the charts and their following text
        // Stockcharts often has text like: "03 IYZ - Telecommunications ETF ... Money Wave is in the Green Buy Zone"
        // Let's just find all tickers in the format "NN TICKER -"
        const chartMatches = [...bodyText.matchAll(/(\d{2})\s+([A-Z]{1,5})\s+-/g)];
        
        chartMatches.forEach(match => {
            const ticker = match[2];
            const index = match.index;
            // Look at the next 500 characters after the ticker for the words "Green Buy Zone" or "Green Zone"
            const context = bodyText.substring(index, index + 500);
            if (context.includes('Green Buy Zone') || context.includes('Green Zone')) {
                inGreenZone.push(ticker);
            }
        });

        console.log("\n--- IN GREEN ZONE ---", inGreenZone);
        console.log("\n--- APPROACHING / SOON ---", approaching);

    } catch (e) {
        console.error('Error:', e.message);
    }
}

scrapeATGL();