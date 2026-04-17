const axios = require('axios');
const cheerio = require('cheerio');

async function testATGL() {
    try {
        const url = 'https://stockcharts.com/public/1107832/chartbook/1135173920';
        console.log(`Scraping ${url}...`);
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        const $ = cheerio.load(response.data);
        
        console.log("--- DROPDOWN OPTIONS ---");
        $('select option').each((i, el) => {
            console.log($(el).text().trim());
        });

    } catch (e) {
        console.error('Error:', e.message);
    }
}

testATGL();
