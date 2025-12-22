import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

/**
 * Analyzes a real estate deal using Gemini.
 * Acts as a skeptical senior underwriter.
 * 
 * @param {object} dealData - { address, price, arv, rehab, rent, notes, ... }
 * @returns {Promise<object>} - { score, verdict, analysis, risks, strengths }
 */
export const analyzeDeal = async (dealData) => {
  if (!model) {
    if (import.meta.env.DEV) {
      console.warn("🔧 DEBUG: VITE_GEMINI_API_KEY is missing. Returning MOCK analysis for development.");
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI processing time
      
      const price = parseFloat(dealData.price) || 0;
      const arv = parseFloat(dealData.arv) || 0;
      const profit = arv - price - (parseFloat(dealData.rehab) || 0);
      
      return {
        success: true,
        data: {
          score: profit > 50000 ? 85 : 45,
          verdict: profit > 50000 ? "GOOD BUY" : "PASS",
          summary: "This is a mock analysis generated because no Gemini API key was found. The numbers suggest a " + (profit > 50000 ? "solid" : "thin") + " spread.",
          risks: ["Mock Risk: Market volatility", "Mock Risk: Unexpected rehab costs"],
          strengths: ["Mock Strength: High demand area", "Mock Strength: Good initial equity"],
          calculated_mao: Math.round(arv * 0.7),
          projected_profit: Math.round(profit)
        }
      };
    }
    console.error("Gemini API Key missing");
    return { 
      success: false, 
      error: "AI Service Unavailable (Missing Key)" 
    };
  }

  try {
    const prompt = `
      You are a cynical, veteran Real Estate Underwriter. I am going to give you details of a potential wholesale deal.
      Your job is to "Sanitize" this deal. Wholesalers often lie or exaggerate. You need to grade the deal based on the numbers provided, but also look for logical inconsistencies.

      Data provided:
      Address: ${dealData.address}
      Asking Price: $${dealData.price}
      claimed ARV: $${dealData.arv}
      Est. Rehab: $${dealData.rehab}
      Est. Rent: $${dealData.rent}
      Notes: ${dealData.notes}
      
      Task:
      1. Calculate the 70% rule: (ARV * 0.70) - Rehab. Compare to Asking Price.
      2. Calculate Cap Rate (approx): ((Rent * 12 * 0.6) / (Price + Rehab)).
      3. Analyze the "Spread": ARV - (Price + Rehab). Is it enough for a flip profit?
      4. Give a "Deal Score" from 0 to 100.
         - 90-100: Absolute Homerun (Deep equity, high cashflow)
         - 75-89: Good Deal (Solid spread)
         - 50-74: Thin / Average (Might work for buy-and-hold, risky flip)
         - <50: Bad Deal / Overpriced
      5. Provide a specific "Verdict": "HOMERUN", "GOOD BUY", "THIN DEAL", or "PASS".
      6. List 3 specific "Risks" (e.g., "Rehab budget seems too low for this spread", "Cap rate is below market average").
      7. List 3 "Strengths".
      8. Write a short, punchy "Underwriter's Summary" (max 2 sentences).

      Return ONLY valid JSON with this structure:
      {
        "score": number,
        "verdict": "string",
        "summary": "string",
        "risks": ["string", "string"],
        "strengths": ["string", "string"],
        "calculated_mao": number,
        "projected_profit": number
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown code blocks if present
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonString);

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      success: false,
      error: "AI Analysis Failed"
    };
  }
};
