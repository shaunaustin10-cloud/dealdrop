const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

async function test() {
  try {
    const symbol = 'AAPL';
    const period1 = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000);
    const period2 = new Date();
    console.log(`Testing with chart(): period1=${period1}, period2=${period2}`);
    const res = await yahooFinance.chart(symbol, { period1, period2 });
    console.log(`Success! Got ${res.quotes.length} quotes.`);
    console.log(`First quote: ${JSON.stringify(res.quotes[0])}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    if (err.errors) console.error(JSON.stringify(err.errors, null, 2));
  }
}

test();
