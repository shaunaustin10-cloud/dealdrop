const axios = require('axios');
const cheerio = require('cheerio');

async function testBarchart() {
    try {
        console.log("Attempting to scrape Barchart Unusual Options Activity...");
        const url = 'https://www.barchart.com/options/unusual-activity/stocks';
        
        // Barchart requires specific headers to not return a 403
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Referer': 'https://www.google.com/'
            }
        });

        const $ = cheerio.load(response.data);
        
        // Barchart often loads data via JSON in a script tag or via a hidden table
        // Let's see if we can find the data in the initial HTML
        const tickers = [];
        $('table tbody tr').each((i, el) => {
            if (i < 10) {
                const ticker = $(el).find('td').first().text().trim();
                if (ticker && ticker.length < 6) {
                    tickers.push(ticker);
                }
            }
        });

        if (tickers.length === 0) {
            console.log("No tickers found in HTML. Barchart might be using dynamic JS loading.");
            // Backup: Look for JSON in scripts
            const scriptData = $('script').text();
            if (scriptData.includes('window.preloadedData')) {
                console.log("Found preloaded JSON data!");
            }
        } else {
            console.log("Successfully found tickers:", tickers);
        }

    } catch (e) {
        console.error("Barchart Scrape Failed:", e.message);
        if (e.response) {
            console.log("Status Code:", e.response.status);
        }
    }
}

testBarchart();
