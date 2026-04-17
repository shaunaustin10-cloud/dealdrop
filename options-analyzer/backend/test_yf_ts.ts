import yahooFinance from 'yahoo-finance2';
console.log("DEFAULT EXPORT:", typeof yahooFinance);
if (typeof yahooFinance.quote === 'function') {
    yahooFinance.quote('AAPL').then(res => console.log("AAPL Price:", res.regularMarketPrice)).catch(console.error);
} else {
    console.log("No quote function on default export. Keys:", Object.keys(yahooFinance));
}
