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
        const bodyText = $('body').text();
        const regex = /\b[A-Z]{2,5}\b/g;
        const matches = bodyText.match(regex) || [];
        const stopWords = ['THE', 'AND', 'FOR', 'YOU', 'NOT', 'ARE', 'THIS', 'WITH', 'NEW', 'BUY', 'SELL', 'ZONE', 'GREEN', 'RED', 'WAVE', 'LINE', 'NYSE', 'NASDAQ', 'AMEX', 'ETF', 'FREE', 'TRIAL', 'LOG', 'OUT', 'YOUR', 'SUPPORT', 'CENTER', 'CONTACT', 'CHART', 'SUMMARY', 'PUBLIC', 'LISTS', 'MONEY', 'TRADE', 'PICKS', 'WEEK', 'DAY', 'MONTH', 'YEAR', 'TIME', 'HIGH', 'LOW', 'BULL', 'BEAR', 'SPX', 'SPY', 'QQQ', 'DIA', 'IWM', 'VIX'];
        
        let tickers = [...new Set(matches)].filter(t => !stopWords.includes(t));
        console.log("Tickers found:", tickers.slice(0, 10));
    } catch (e) {
        console.error('Error:', e.message);
    }
}

testATGL();
