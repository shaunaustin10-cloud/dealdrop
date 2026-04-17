const axios = require('axios');

async function testNasdaq() {
    try {
        console.log("Attempting to scrape Nasdaq Unusual Options Activity (JSON API)...");
        // This is a common internal endpoint Nasdaq uses for their dashboard
        const url = 'https://api.nasdaq.com/api/quote/unusual-options/AAPL?assetclass=stocks';
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Origin': 'https://www.nasdaq.com',
                'Referer': 'https://www.nasdaq.com/'
            }
        });

        if (response.data && response.data.data) {
            console.log("Success! Nasdaq API returned data.");
            console.log("Sample Data:", response.data.data.table.rows.slice(0, 3));
        } else {
            console.log("Nasdaq returned an empty response.");
        }

    } catch (e) {
        console.error("Nasdaq Scrape Failed:", e.message);
    }
}

testNasdaq();
