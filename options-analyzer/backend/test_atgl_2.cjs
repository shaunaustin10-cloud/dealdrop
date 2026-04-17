const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeATGL() {
    try {
        const url = 'https://stockcharts.com/public/1107832';
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(response.data);
        
        let inGreenZone = [];
        let approaching = [];
        let other = [];

        // The layout of stockcharts public list:
        // Each chart has a title like: <h3 class="chart-title">...</h3> or similar.
        // Let's iterate over common title tags.
        const titles = [];
        $('.chart-title, h3, h4').each((i, el) => {
            const title = $(el).text().trim();
            // Match pattern like "03 IYZ" or "INTC"
            const match = title.match(/(?:\d+\s+)?([A-Z]{1,5})(?:\s+|-)/);
            if (match && match[1]) {
                titles.push({ ticker: match[1], el });
            }
        });

        console.log(`Found ${titles.length} charts/titles with tickers.`);

        titles.forEach(({ticker, el}) => {
            // Find the closest paragraph or text block that might be the comment
            const parent = $(el).parent().parent();
            const text = parent.text();

            if (text.includes('Green Buy Zone') || text.includes('Green Zone')) {
                if (!inGreenZone.includes(ticker)) inGreenZone.push(ticker);
            } else if (text.includes('Soon') || text.includes('approaching')) {
                if (!approaching.includes(ticker)) approaching.push(ticker);
            }
        });

        console.log("\n--- IN GREEN ZONE ---", inGreenZone);
        console.log("\n--- APPROACHING / SOON ---", approaching);

    } catch (e) {
        console.error('Error:', e.message);
    }
}

scrapeATGL();