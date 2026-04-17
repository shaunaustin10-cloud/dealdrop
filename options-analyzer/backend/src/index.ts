import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import * as cheerio from 'cheerio';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Global Error Handlers to prevent silent crashes
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

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

/**
 * UPGRADED Scraper: Above the Green Line (StockCharts Joanne Klein Public List)
 * Now extracts specifically the stocks in the "Green Zone" and those "Approaching" it.
 */
const scrapeATGL = async () => {
    try {
        const url = 'https://stockcharts.com/public/1107832';
        const response = await axios.get(url, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36' 
            }
        });
        const $ = cheerio.load(response.data);
        const bodyText = $('body').text();
        
        let foundTickers: any[] = [];
        let seen = new Set();

        // 1. Find the "Approaching / Soon" list
        const soonMatch = bodyText.match(/Soon for ([A-Z\s]+)(?:&|and)/i);
        if (soonMatch && soonMatch[1]) {
            let approaching = soonMatch[1].trim().split(/\s+/);
            approaching.forEach(t => {
                if (t.length >= 2 && !seen.has(t)) {
                    foundTickers.push({ ticker: t, status: 'Approaching', context: 'Approaching the Green Zone' });
                    seen.add(t);
                }
            });
        }

        // 2. Find charts explicitly in the Green Zone
        const chartMatches = [...bodyText.matchAll(/(\d{2})\s+([A-Z]{1,5})\s+-/g)];
        chartMatches.forEach(match => {
            const ticker = match[2];
            const index = match.index!;
            const context = bodyText.substring(index, index + 500);
            if ((context.includes('Green Buy Zone') || context.includes('Green Zone')) && !seen.has(ticker)) {
                foundTickers.push({ ticker, status: 'In Green Zone', context: 'Currently in the Green Buy Zone' });
                seen.add(ticker);
            }
        });

        console.log(`[ATGL] Found ${foundTickers.length} tickers. Fetching real-time quotes...`);
        
        // Fetch real-time quotes via Axios to Yahoo API
        const enrichedTickers = [];
        for (const item of foundTickers) {
            try {
                // Using Yahoo Finance Chart API (v8) which requires no authentication and is stable
                const quoteResponse = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${item.ticker}?interval=1d`, {
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                
                const meta = quoteResponse.data?.chart?.result?.[0]?.meta;
                if (meta) {
                    const price = meta.regularMarketPrice;
                    const prevClose = meta.chartPreviousClose;
                    const changePercent = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
                    
                    enrichedTickers.push({
                        ...item,
                        price: price,
                        changePercent: changePercent
                    });
                } else {
                    enrichedTickers.push(item);
                }
            } catch (e) {
                console.error(`[ATGL] Error fetching quote for ${item.ticker}:`, (e as any).message);
                enrichedTickers.push(item); // keep it even if quote fails
            }
        }

        return enrichedTickers;
    } catch (e) {
        console.error('ATGL Scrape Error:', e);
        return [];
    }
};

/**
 * Placeholder for Unusual Flow (Transitioning to Real Data)
 * This will soon integrate with Schwab API or Yahoo Scraper.
 */
const scrapeUnusualFlow = async (atglTickers: any[] = []) => {
    try {
        // For now, prioritize analyzing the ATGL tickers we found
        const tickersToAnalyze = atglTickers.length > 0 
            ? atglTickers.map(t => t.ticker) 
            : ['NVDA', 'TSLA', 'MARA', 'COIN', 'MSTR', 'PLTR', 'AMD', 'SMCI', 'BABA', 'META'];

        // MOCK DATA for now - but targeted at our ATGL list!
        const flow = tickersToAnalyze.slice(0, 10).map(ticker => ({
            ticker,
            strike: Math.floor(Math.random() * 500),
            exp: '2026-03-20',
            vol: Math.floor(Math.random() * 8000 + 2000),
            oi: Math.floor(Math.random() * 3000 + 500),
            ratio: (Math.random() * 6 + 1).toFixed(2),
            type: Math.random() > 0.5 ? 'CALL' : 'PUT',
            isAtgl: true // Flagging that this matches the strategy
        })).filter(f => parseFloat(f.ratio) > 1.5);
        
        return flow;
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

/**
 * MAIN SCANNER LOOP
 * Orchestrates the "Double Filter" Strategy (ATGL + Unusual Flow)
 */
const runBackgroundScanner = async () => {
    scanStatus.active = true;
    
    scanStatus.currentTask = 'Scraping ATGL (Trend Filter)';
    const atgl = await scrapeATGL();
    
    scanStatus.currentTask = 'Scraping Flow (Momentum Filter)';
    const unusual = await scrapeUnusualFlow(atgl);
    
    scanStatus.currentTask = 'Analyzing Social Pulse';
    const social = await scrapeSocialSentiment();
    
    scanStatus.currentTask = 'Fetching Finance News';
    const news = await scrapeNews();

    cachedPulse = {
        atgl,
        unusual,
        social,
        news,
        timestamp: new Date().toISOString(),
        schwabStatus: process.env.SCHWAB_CLIENT_ID ? 'Configured (Awaiting Tuesday Approval)' : 'Not Configured'
    };
    
    scanStatus.active = false;
    scanStatus.lastCompleted = new Date().toLocaleTimeString();
    console.log(`[SCAN COMPLETE] ${scanStatus.lastCompleted} - Found ${unusual.length} Flow matches in ATGL list.`);
};

let schwabTokens: any = null;

// API Endpoints

// Schwab OAuth Endpoints
app.get('/api/schwab/mock', (req: Request, res: Response) => {
    schwabTokens = { access_token: 'mock_token', refresh_token: 'mock_refresh' };
    console.log('[SCHWAB] Mock tokens generated via Dev Bypass!');
    res.json({ success: true });
});

app.get('/api/schwab/login-url', (req: Request, res: Response) => {
    const clientId = process.env.SCHWAB_CLIENT_ID;
    const redirectUri = process.env.SCHWAB_REDIRECT_URI;
    if (!clientId) {
        return res.status(500).json({ error: 'SCHWAB_CLIENT_ID not configured.' });
    }
    // Schwab Authorize URL
    const authUrl = `https://api.schwabapi.com/v1/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri as string)}`;
    res.json({ url: authUrl });
});

app.post('/api/schwab/token', async (req: Request, res: Response) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ error: 'Authorization code is required.' });
    }

    const clientId = process.env.SCHWAB_CLIENT_ID!;
    const clientSecret = process.env.SCHWAB_CLIENT_SECRET!;
    const redirectUri = process.env.SCHWAB_REDIRECT_URI!;

    try {
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', redirectUri);
        params.append('client_id', clientId); // Added for compatibility

        console.log('[SCHWAB] Exchanging code for token...', { 
            redirect_uri: redirectUri,
            code: code.substring(0, 5) + '...'
        });

        const response = await axios.post('https://api.schwabapi.com/v1/oauth/token', params.toString(), {
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        schwabTokens = response.data;
        // The response contains access_token and refresh_token
        console.log('[SCHWAB] Successfully retrieved tokens!');
        res.json({ success: true, message: 'Schwab connected successfully!' });
    } catch (error: any) {
        const errorData = error.response?.data;
        console.error('[SCHWAB] Token exchange failed:', errorData || error.message);
        res.status(500).json({ 
            error: 'Failed to exchange token with Schwab.',
            details: errorData || error.message
        });
    }
});

app.get('/api/schwab/status', (req: Request, res: Response) => {
    res.json({ connected: !!schwabTokens });
});

app.get('/api/market/pulse', (req: Request, res: Response) => {
    if (cachedPulse) {
        res.json(cachedPulse);
    } else {
        res.json({ loading: true, status: scanStatus });
    }
});

app.get('/api/scan/status', (req: Request, res: Response) => {
    res.json(scanStatus);
});

// Mock Schwab Config Endpoint for Frontend
app.get('/api/config/schwab', (req: Request, res: Response) => {
    res.json({
        hasClientId: !!process.env.SCHWAB_CLIENT_ID,
        hasSecret: !!process.env.SCHWAB_CLIENT_SECRET,
        redirectUri: process.env.SCHWAB_REDIRECT_URI || 'Not Set'
    });
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
            score: 85, // Placeholder for the new ATGL logic
            rules: { 
                rule1: true, // Above Green Line
                rule2: true, // Money Wave Buy
                rule3: false // Caution Zone
            }
        },
        message: 'Direct Schwab API integration coming Tuesday.'
    });
});

app.get('/api/sports/matches', (req: Request, res: Response) => {
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
        }
    ];
    res.json(matches);
});

setInterval(runBackgroundScanner, 5 * 60 * 1000);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aggregator Server running on port ${PORT}`);
    console.log(`SCHWAB_REDIRECT_URI: ${process.env.SCHWAB_REDIRECT_URI}`);
    try {
        runBackgroundScanner();
    } catch (e) {
        console.error('Initial background scan failed:', e);
    }
});
