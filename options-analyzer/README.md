# Options & Sports Aggregator

A real-time data aggregation platform for identifying high-probability entries in stock options and sports betting markets, specifically optimized for ThinkorSwim (TOS) execution.

## Features

### 1. Options Intelligence (Aggregator Model)
- **ATGL Momentum:** Scrapes "Above the Green Line" institutional trend data from StockCharts.
- **Unusual Flow:** Aggregates unusual volume/open interest ratios for high-probability option contracts.
- **Social Pulse:** Tracks sentiment across r/wallstreetbets and other finance forums.
- **Market News:** Real-time financial news feed integration.
- **TOS Bridge:** Direct integration with ThinkorSwim via Scan CSV sync and custom ThinkScript generation.

### 2. Sports Betting Analyzer
- **Soccer 1H Goals:** Poisson Distribution model for predicting 1st half goal probabilities.
- **Win Probability:** Simplified win/loss/draw estimation based on historical scoring averages.
- **Straight Bets:** Data-driven insights for basketball and football.

## Getting Started

### Prerequisites
- Node.js (v18+)
- NPM

### Installation

1. **Install Backend Dependencies:**
   ```bash
   cd options-analyzer/backend
   npm install
   ```
2. **Install Frontend Dependencies:**
   ```bash
   cd options-analyzer/frontend
   npm install
   ```

### Running the Project

1. **Start the Backend (Aggregator):**
   ```bash
   cd options-analyzer/backend
   npm run dev
   ```
   *The backend runs on port 3001.*

2. **Start the Frontend:**
   ```bash
   cd options-analyzer/frontend
   npm run dev
   ```
   *The frontend runs on port 5173.*

## Technologies Used
- **Frontend:** React, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend:** Node.js, Express, Cheerio (Scraping), Axios.
- **TOS Integration:** ThinkScript, CSV Parsing.
