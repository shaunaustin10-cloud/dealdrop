import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import * as cheerio from 'cheerio';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      console.log(`[ERROR] ${req.method} ${req.url} returned status ${res.statusCode}`);
    }
  });
  next();
});

let cachedPulse: any = null;
let scanStatus = {
  active: false,
  currentTask: '',
  progress: 0,
  total: 0,
  lastCompleted: ''
};

// Scraper: Above the Green Line (StockCharts)
const scrapeATGL = async () => {
    try {
        const url = 'https://stockcharts.com/public/1107832/chartbook/1135173920';
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(response.data);
        const bodyText = $('body').text();
        const regex = /\b[A-Z]{2,5}\b/g;
        const matches = bodyText.match(regex) || [];
        const stopWords = ['THE', 'AND', 'FOR', 'YOU', 'NOT', 'ARE', 'THIS', 'WITH', 'NEW', 'BUY', 'SELL', 'ZONE', 'GREEN', 'RED', 'WAVE', 'LINE', 'NYSE', 'NASDAQ', 'AMEX', 'ETF', 'FREE', 'TRIAL', 'LOG', 'OUT', 'YOUR', 'SUPPORT', 'CENTER', 'CONTACT', 'CHART', 'SUMMARY', 'PUBLIC', 'LISTS', 'MONEY', 'TRADE', 'PICKS', 'WEEK', 'DAY', 'MONTH', 'YEAR', 'TIME', 'HIGH', 'LOW', 'BULL', 'BEAR', 'SPX', 'SPY', 'QQQ', 'DIA', 'IWM', 'VIX'];
        
        let tickers = [...new Set(matches)].filter(t => !stopWords.includes(t));
        return tickers.slice(0, 15);
    } catch (e) {
        console.error('ATGL Scrape Error:', e);
        return [];
    }
};

const scrapeUnusualFlow = async () => {
    try {
        const highVolatility = ['NVDA', 'TSLA', 'MARA', 'COIN', 'MSTR', 'PLTR', 'AMD', 'SMCI', 'BABA', 'META'];
        const mockFlow = highVolatility.map(ticker => ({
            ticker,
            strike: Math.floor(Math.random() * 500),
            exp: '2026-03-20',
            vol: Math.floor(Math.random() * 5000 + 1000),
            oi: Math.floor(Math.random() * 2000 + 500),
            ratio: (Math.random() * 5 + 1).toFixed(2),
            type: Math.random() > 0.5 ? 'CALL' : 'PUT'
        })).filter(f => parseFloat(f.ratio) > 2.0);
        
        return mockFlow;
    } catch (e) {
        return [];
    }
};

const scrapeSocialSentiment = async () => {
    try {
        const tickers = ['NVDA', 'TSLA', 'SPY', 'QQQ', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NFLX'];
        return tickers.slice(0, 5).map(t => ({
            ticker: t,
            sentiment: Math.random() > 0.4 ? 'Bullish' : 'Mixed',
            mentionCount: Math.floor(Math.random() * 1000 + 200),
            source: Math.random() > 0.5 ? 'r/wallstreetbets' : 'r/options'
        }));
    } catch (e) {
        return [];
    }
};

const scrapeNews = async () => {
    try {
        const url = 'https://finance.yahoo.com/rss/topstories';
        const response = await axios.get(url);
        const $ = cheerio.load(response.data, { xmlMode: true });
        const items: any[] = [];
        $('item').each((i, el) => {
            if (i < 5) {
                items.push({
                    title: $(el).find('title').text(),
                    link: $(el).find('link').text(),
                    pubDate: $(el).find('pubDate').text()
                });
            }
        });
        return items;
    } catch (e) {
        return [];
    }
};

const runBackgroundScanner = async () => {
    scanStatus.active = true;
    scanStatus.currentTask = 'Scraping ATGL';
    const atgl = await scrapeATGL();
    
    scanStatus.currentTask = 'Scraping Unusual Flow';
    const unusual = await scrapeUnusualFlow();
    
    scanStatus.currentTask = 'Analyzing Social Pulse';
    const social = await scrapeSocialSentiment();
    
    scanStatus.currentTask = 'Fetching Finance News';
    const news = await scrapeNews();

    cachedPulse = {
        atgl,
        unusual,
        social,
        news,
        timestamp: new Date().toISOString()
    };
    
    scanStatus.active = false;
    scanStatus.lastCompleted = new Date().toLocaleTimeString();
};

app.get('/api/market/pulse', (req: Request, res: Response) => {
    if (cachedPulse) {
        res.json(cachedPulse);
    } else {
        res.json({ loading: true });
    }
});

app.get('/api/scan/status', (req: Request, res: Response) => {
    res.json(scanStatus);
});

app.get('/api/options/:symbol', async (req: Request, res: Response) => {
    const { symbol } = req.params;
    res.json({
        quote: {
            symbol,
            regularMarketPrice: 0,
            regularMarketChange: 0,
            regularMarketChangePercent: 0,
            fullExchangeName: 'ANALYZER DATA'
        },
        options: [{
            options: [{
                calls: [],
                puts: []
            }]
        }],
        atgl: {
            score: 0,
            rules: { rule1: false, rule2: false, rule3: false }
        },
        message: 'Use aggregated pulse for data.'
    });
});

app.get('/api/sports/matches', (req: Request, res: Response) => {
    // Mocking high-probability sports entries for Soccer and NBA
    const matches = [
        {
            sport: 'Soccer',
            league: 'Premier League',
            time: '14:30 EST',
            home: 'Arsenal',
            away: 'Liverpool',
            firstHalfGoalProb: 78.5,
            bttsProb: 65.2,
            socialLean: 'Over 2.5 Goals'
        },
        {
            sport: 'Soccer',
            league: 'MLS',
            time: '19:30 EST',
            home: 'Inter Miami',
            away: 'LA Galaxy',
            firstHalfGoalProb: 82.1,
            bttsProb: 71.4,
            socialLean: 'Miami 1H Win'
        },
        {
            sport: 'Soccer',
            league: 'Premier League',
            time: '10:00 EST',
            home: 'Man City',
            away: 'Chelsea',
            firstHalfGoalProb: 75.0,
            bttsProb: 68.9,
            socialLean: 'BTTS Yes'
        },
        {
            sport: 'Basketball',
            league: 'NBA',
            time: '19:00 EST',
            home: 'Celtics',
            away: 'Bucks',
            moneylineLean: 'Celtics -4.5',
            winProb: 68.2,
            keyStat: 'Tatum avg 32pts L5'
        },
        {
            sport: 'Basketball',
            league: 'NBA',
            time: '22:00 EST',
            home: 'Lakers',
            away: 'Warriors',
            moneylineLean: 'Lakers ML',
            winProb: 55.4,
            keyStat: 'AD double-double streak'
        },
        {
            sport: 'Basketball',
            league: 'NBA',
            time: '20:30 EST',
            home: 'Nuggets',
            away: 'Suns',
            moneylineLean: 'Nuggets -6',
            winProb: 72.1,
            keyStat: 'Jokic triple-double prob'
        }
    ];
    
    res.json(matches);
});

setInterval(runBackgroundScanner, 5 * 60 * 1000);

app.listen(PORT, () => {
    console.log(`Aggregator Server running on port ${PORT}`);
    runBackgroundScanner();
});
