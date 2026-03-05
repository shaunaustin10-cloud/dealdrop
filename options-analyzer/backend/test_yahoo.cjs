const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

async function test() {
  try {
    const symbol = 'AAPL';
    const options = await yahooFinance.options(symbol);
    console.log(JSON.stringify(options, null, 2));
  } catch (error) {
    console.error(error);
  }
}

test();
