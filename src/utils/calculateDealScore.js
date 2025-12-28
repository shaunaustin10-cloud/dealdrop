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
export const calculateDealScore = ({ price, arv, rehab, rent, hasPool }) => {
    const purchasePrice = Number(price) || 0;
    const afterRepairValue = Number(arv) || 0;
    const rehabCost = Number(rehab) || 0;
    const monthlyRent = Number(rent) || 0;
    const pool = hasPool === true || hasPool === 'true';

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
    let verdict = "PASS";
    let color = "text-red-500";
    if (finalScore >= 85) { verdict = "HOMERUN"; color = "text-emerald-400"; }
    else if (finalScore >= 70) { verdict = "GOOD BUY"; color = "text-green-400"; }
    else if (finalScore >= 50) { verdict = "THIN DEAL"; color = "text-yellow-400"; }

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
