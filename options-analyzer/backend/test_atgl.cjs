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

        // Check for general comments
        const generalComments = $('.chartlist-notes').text();
        console.log("--- GENERAL COMMENTS ---");
        console.log(generalComments.substring(0, 500));
        
        // Match ticker and status
        $('.chart-item').each((i, el) => {
            const title = $(el).find('.chart-title').text().trim();
            const notes = $(el).find('.chart-notes').text().trim() || $(el).find('.chart-comment').text().trim() || $(el).find('p').text().trim();
            
            // Extract ticker from title (e.g., "03 IYZ - Telecommunications ETF")
            let ticker = "UNKNOWN";
            const match = title.match(/(?:\d+\s+)?([A-Z]{1,5})(?:\s+|-)/);
            if (match && match[1]) {
                ticker = match[1];
            } else if (title) {
                ticker = title;
            }

            if (notes.includes('Green Buy Zone')) {
                inGreenZone.push(ticker);
            } else if (notes.includes('Soon') || notes.includes('approaching')) {
                approaching.push(ticker);
            } else if (notes.includes('Money Wave Buy')) {
                other.push(`${ticker} (Buy Signal)`);
            }
        });

        console.log("\n--- IN GREEN ZONE ---");
        console.log(inGreenZone);
        console.log("\n--- APPROACHING / SOON ---");
        console.log(approaching);
        console.log("\n--- OTHER ---");
        console.log(other);

    } catch (e) {
        console.error('Error:', e.message);
    }
}

scrapeATGL();