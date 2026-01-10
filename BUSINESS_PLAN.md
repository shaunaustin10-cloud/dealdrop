# Business Plan: REI Deal Drop

**Date:** January 4, 2026
**Version:** 1.0
**Status:** MVP / Beta Phase

---

## 1. Executive Summary
**REI Deal Drop** is an AI-powered real estate investment analysis platform designed to bring transparency and speed to the deal valuation process. By leveraging Generative AI (Google Gemini 2.0 Flash) to act as a "conservative veteran underwriter," the platform helps investors cut through inflated numbers and helps agents/wholesalers present data-backed listing presentations.

**Core Value Proposition:**
*   **For Investors:** Instantly verify deal numbers and identify "fluff" in wholesaler packets.
*   **For Wholesalers/Agents:** Generate professional, credible PDF reports that build trust with buyers.
*   **Speed:** Reduce analysis time from hours to seconds.

---

## 2. Company Overview

### 2.1 Mission Statement
To democratize institutional-grade real estate underwriting, enabling individual investors and agents to make data-driven decisions with confidence.

### 2.2 The Problem
*   **Inflated Numbers:** Wholesalers often exaggerate ARV (After Repair Value) and underestimate rehab costs.
*   **Analysis Paralysis:** Investors waste hours analyzing bad deals manually.
*   **Presentation Quality:** Agents and wholesalers struggle to create clean, professional deal packets quickly.

### 2.3 The Solution
A web-based SaaS platform that inputs raw deal data and outputs a rigorous, AI-driven "Sanitized" analysis, complete with a confidence score, calculated MAO (Maximum Allowable Offer), and professional PDF reporting.

---

## 3. Market Analysis

### 3.1 Target Audience
| Persona | Pain Point | Benefit |
| :--- | :--- | :--- |
| **Real Estate Investors** | Wasting time on bad deals; fear of overpaying. | "Conservative" AI validation; instant Buy/Pass verdict. |
| **Wholesalers** | Buyers don't trust their numbers; slow to sell deals. | Credible, neutral third-party reports; faster dispositions. |
| **Real Estate Agents** | Need to impress sellers/investors with data. | "CMA on Steroids" listing presentations; branded reports. |

### 3.2 Market Trends
*   **AI Adoption:** Real estate professionals are increasingly adopting AI for efficiency.
*   **Market Volatility:** In shifting markets, accurate data (ARV, Rent) is more critical than ever.
*   **SaaS Fatigue:** Users prefer "all-in-one" tools over fragmented subscriptions (e.g., separate tools for comps, mapping, and analysis).

---

## 4. Product & Services

### 4.1 Core Features
1.  **AI Underwriter Engine:**
    *   Powered by Gemini 2.0 Flash.
    *   **Prompt Engineering:** Specifically prompted to be "conservative" and look for logical inconsistencies in provided numbers (e.g., low rehab budget for a high spread).
    *   **Outputs:** Deal Score (0-100), Verdict (e.g., "HOMERUN"), Risks vs. Strengths analysis.
2.  **Smart Valuation Tools:**
    *   **70% Rule Calculator:** Standard flipping formula automation.
    *   **Rental Analysis:** Cap rate and cash flow projections.
    *   **Market Data:** Integration with RentCast for rental comps and active market data.
3.  **Reporting:**
    *   One-click PDF generation.
    *   Includes maps, photos, financial breakdown, and the AI verdict.
4.  **Deal Management:**
    *   Save and track deals in a dashboard.
    *   Map view for location-based analysis.

---

## 5. Business Model (Monetization)

The platform operates on a Freemium SaaS (Software as a Service) model with Stripe integration.

### 5.1 Pricing Tiers

| Tier | Price | Target User | Key Features |
| :--- | :--- | :--- | :--- |
| **Starter** | **Free** | Curious Beginners | 3 Analyses/mo, Basic Data. |
| **Lite Investor** | **$19/mo** | Weekend Warriors | 15 Analyses/mo, Standard Reports. |
| **Pro Investor** | **$49/mo** | Serious Buyers | **Unlimited AI Analysis**, Full Rental Reports, Priority Support. |
| **Business** | **$149/mo** | Teams / Brokerages | White-label Reports (Custom Logo), Team Seats (3), Dedicated Support. |

*Annual billing offers a ~20% discount to incentivize retention.*

---

## 6. Marketing & Sales Strategy

### 6.1 Go-to-Market (GTM)
1.  **Product-Led Growth (PLG):**
    *   Free tier allows users to experience the "Aha!" moment (the AI Verdict) without credit card friction.
    *   "Share Report" feature acts as a viral loop (Report contains "Powered by REI Deal Drop" branding).
2.  **Content Marketing:**
    *   Blog posts on "How to Spot a Bad Wholesaler Deal" using the tool.
    *   YouTube tutorials: "Analyzing a Live Deal in 30 Seconds."
3.  **Partnerships:**
    *   Affiliate program for Real Estate Influencers and Educators.

### 6.2 Sales Channels
*   **Self-Serve:** Direct website sign-up (primary).
*   **Direct Sales:** For "Business" tier (brokerages and large wholesaling shops).

---

## 7. Operational Plan

### 7.1 Technology Stack
*   **Frontend:** React, Tailwind CSS, Vite.
*   **Backend:** Firebase (Auth, Firestore, Functions).
*   **AI:** Google Gemini API.
*   **Payments:** Stripe.
*   **Maps:** Google Maps API.
*   **PDF Engine:** jsPDF.

### 7.2 Key Metrics (KPIs)
*   **CAC (Customer Acquisition Cost):** Target <$50 (organic focus initially).
*   **LTV (Lifetime Value):** Target >$500 (10+ months retention on Pro).
*   **Churn Rate:** Monitor closely; reduce via feature updates (e.g., mobile app, CRM integrations).
*   **Reports Generated:** A proxy for user engagement and value delivery.

---

## 8. Financial Roadmap

### Phase 1: Launch & Validation (Months 1-3)
*   **Goal:** 100 Active Users (Free + Paid).
*   **Focus:** Stability, fixing bugs, gathering feedback on AI accuracy.
*   **Revenue Target:** $500 MRR (Monthly Recurring Revenue).

### Phase 2: Growth (Months 4-9)
*   **Goal:** 1,000 Active Users.
*   **Focus:** Marketing partnerships, SEO, introducing "Business" tier features.
*   **Revenue Target:** $5,000 MRR.

### Phase 3: Scale (Months 10+)
*   **Goal:** 5,000+ Users.
*   **Focus:** Mobile App development, API for CRM integrations.
*   **Revenue Target:** $25,000+ MRR.
