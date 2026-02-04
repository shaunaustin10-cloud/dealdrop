/**
 * Calculates a Deal Score (0-100) and key financial metrics.
 * 
 * @param {object} params
 * @param {number} params.price - Purchase Price
 * @param {number} params.arv - After Repair Value
 * @param {number} params.rehab - Estimated Rehab Cost
 * @param {number} params.rent - Estimated Monthly Rent
 * @param {number} params.sqft - Square Footage (used for sanity checks)
 * @returns {object} - { score, verdict, metrics: { roi, cashFlow, equity, capRate } }
 */
export const calculateDealScore = ({ price, arv, rehab, rent, hasPool, soldPrice }) => {
    const purchasePrice = Number(price) || 0;
    const afterRepairValue = Number(arv) || 0;
    const rehabCost = Number(rehab) || 0;
    const monthlyRent = Number(rent) || 0;
    const pool = hasPool === true || hasPool === 'true';
    const finalSoldPrice = Number(soldPrice) || 0;

    // 0. Sold Deal Logic (Realized Profit)
    if (finalSoldPrice > 0) {
        const totalInvestment = purchasePrice + rehabCost;
        const profit = finalSoldPrice - totalInvestment;
        const roi = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;
        
        let score = 0;
        let verdict = "PASS";
        let color = "text-slate-500";

        if (roi >= 20) { score = 100; verdict = "HOMERUN (SOLD)"; color = "text-emerald-600 dark:text-emerald-400"; }
        else if (roi >= 15) { score = 90; verdict = "GREAT (SOLD)"; color = "text-emerald-600 dark:text-emerald-400"; }
        else if (roi >= 10) { score = 80; verdict = "GOOD (SOLD)"; color = "text-green-600 dark:text-green-400"; }
        else if (roi > 0) { score = 65; verdict = "OK (SOLD)"; color = "text-amber-600 dark:text-amber-400"; }
        else { score = 40; verdict = "LOSS (SOLD)"; color = "text-red-600 dark:text-red-500"; }

        return {
            score,
            verdict,
            verdictColor: color,
            metrics: {
                mao: 0,
                capRate: 0,
                equity: 0,
                roi: roi.toFixed(1),
                totalInvestment,
                profit
            }
        };
    }

    if (purchasePrice === 0 || afterRepairValue === 0) {
        return {
            score: 0,
            verdict: "INCOMPLETE",
            metrics: {}
        };
    }

    const totalInvestment = purchasePrice + rehabCost;
    
    // 1. The 70% Rule Score (Wholesaler/Flipper Standard)
    // Target Max Allowable Offer (MAO) = (ARV * 0.70) - Rehab
    const mao = (afterRepairValue * 0.70) - rehabCost;
    
    let flipScore = 0;
    if (purchasePrice <= mao) flipScore = 100;
    else if (purchasePrice <= mao * 1.1) flipScore = 75; // Close
    else if (purchasePrice <= mao * 1.2) flipScore = 50; // Thin
    else flipScore = 20; // Overpriced

    // 2. Cash Flow / Rental Score (Buy & Hold Standard)
    // Simple 1% Rule: Does Rent >= 1% of Purchase Price?
    // More advanced: Cap Rate = (Net Operating Income / Total Investment)
    // Approx Expenses (50% rule for quick math): 50% of rent goes to expenses (vacancy, repairs, capex, taxes, insurance, mgmt)
    // NOI = Rent * 0.5 * 12
    const annualGrossRent = monthlyRent * 12;
    const noi = annualGrossRent * 0.6; // Being slightly more optimistic than 50% rule (60% margin)
    const capRate = totalInvestment > 0 ? (noi / totalInvestment) * 100 : 0;

    let rentalScore = 0;
    if (capRate >= 10) rentalScore = 100;
    else if (capRate >= 8) rentalScore = 85;
    else if (capRate >= 6) rentalScore = 60;
    else if (capRate >= 4) rentalScore = 40;
    else rentalScore = 10;

    // Weighted Final Score (Prioritizing Flip logic slightly as it's safer for value)
    // If Rent is 0, it's purely a flip.
    let finalScore = 0;
    if (monthlyRent > 0) {
        finalScore = (flipScore * 0.6) + (rentalScore * 0.4);
    } else {
        finalScore = flipScore;
    }

    // Pool Bonus: A pool can add desirability/value, bumping the score slightly
    if (pool) {
        finalScore += 5;
    }

    finalScore = Math.round(Math.min(100, Math.max(0, finalScore)));

    // Verdict
    let verdict = "SPECULATIVE";
    let color = "text-orange-600 dark:text-orange-400";
    if (finalScore >= 85) { verdict = "ELITE"; color = "text-emerald-600 dark:text-emerald-400"; }
    else if (finalScore >= 70) { verdict = "STRONG"; color = "text-green-600 dark:text-green-400"; }
    else if (finalScore >= 50) { verdict = "OPPORTUNITY"; color = "text-amber-600 dark:text-amber-400"; }

    // Metrics
    const equity = afterRepairValue - totalInvestment;
    const roi = totalInvestment > 0 ? (equity / totalInvestment) * 100 : 0;

    return {
        score: finalScore,
        verdict,
        verdictColor: color,
        metrics: {
            mao,
            capRate: capRate.toFixed(1),
            equity,
            roi: roi.toFixed(1),
            totalInvestment
        }
    };
};
