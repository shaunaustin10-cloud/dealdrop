/**
 * Service for RentCast Real Estate Data API.
 * CLIENT-SIDE VERSION (For Development/Internal Use)
 */

// Use local proxy to avoid CORS issues
const BASE_URL = '/api/rentcast/v1';
const API_KEY = import.meta.env.VITE_RENTCAST_API_KEY;

/**
 * Helper to parse a single address string into components.
 * Supports:
 * - "123 Main St, City, ST 12345"
 * - "123 Main St, City, ST"
 */
const parseAddress = (addressString) => {
  if (!addressString) return null;
  
  const parts = addressString.split(',').map(p => p.trim());
  
  if (parts.length >= 3) {
    // Standard: Street, City, State Zip
    const address = parts[0];
    const city = parts[1];
    const statePart = parts[2]; // "ST 12345" or "ST"
    
    const stateZip = statePart.split(' ').filter(Boolean);
    const state = stateZip[0];
    const zip = stateZip.length > 1 ? stateZip[1] : '';

    return { address, city, state, zip };
  } 
  
  return null;
};

export const fetchPropertyData = async (addressString) => {
  console.log("Fetching data for:", addressString); // Debug

  const parsed = parseAddress(addressString);
  if (!parsed) {
    return { success: false, error: "Format Error: Please use 'Street, City, State' (e.g., 123 Main St, Dallas, TX)" };
  }

  if (!API_KEY) {
    if (import.meta.env.DEV) {
      console.warn("🔧 DEBUG: VITE_RENTCAST_API_KEY is missing. Returning MOCK data for development.");
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      const mockPrice = 250000 + (Math.random() * 100000);
      return {
        success: true,
        data: {
          arv: Math.round(mockPrice),
          arvRange: { low: Math.round(mockPrice * 0.9), high: Math.round(mockPrice * 1.1) },
          rentEstimate: Math.round(mockPrice * 0.008),
          rentRange: { low: Math.round(mockPrice * 0.007), high: Math.round(mockPrice * 0.009) },
          confidenceScore: 92,
          comps: [
            { address: "123 Mock St", price: Math.round(mockPrice * 0.95), distance: "0.2mi", date: "2025-10-15" },
            { address: "456 Fake Ave", price: Math.round(mockPrice * 1.05), distance: "0.5mi", date: "2025-11-02" }
          ],
          rentComps: [
            { address: "789 Rental Rd", rent: Math.round(mockPrice * 0.008), distance: "0.3mi", date: "2025-09-20" }
          ],
          latitude: 37.7749,
          longitude: -122.4194,
          yearBuilt: "1995",
          sqft: 1850,
          bedrooms: 3,
          bathrooms: 2,
          propertyType: "Single Family"
        }
      };
    }
    console.error("VITE_RENTCAST_API_KEY is missing.");
    return { success: false, error: "System Error: API Key missing." };
  }

  try {
    const headers = { 
      'X-Api-Key': API_KEY, 
      'accept': 'application/json' 
    };

    // Construct Query Params
    const queryParams = new URLSearchParams({
      address: parsed.address,
      city: parsed.city,
      state: parsed.state,
    });
    if (parsed.zip) queryParams.append('zip', parsed.zip);

    console.log("Calling API proxy...", queryParams.toString());

    // 1. Fetch Value Estimate (ARV)
    const valueRes = await fetch(`${BASE_URL}/avm/value?${queryParams.toString()}`, { headers });
    
    if (!valueRes.ok) {
      const errText = await valueRes.text();
      console.error("Value API Error:", valueRes.status, errText);
      if (valueRes.status === 404) return { success: false, error: "Property not found in database." };
      return { success: false, error: `Data Provider Error: ${valueRes.statusText}` };
    }
    
    const valueData = await valueRes.json();

    // 2. Fetch Rent Estimate
    const rentRes = await fetch(`${BASE_URL}/avm/rent/long-term?${queryParams.toString()}`, { headers });
    
    let rentData = null;
    if (rentRes.ok) {
      rentData = await rentRes.json();
    } else {
        console.warn("Rent API Warning:", rentRes.status, await rentRes.text());
    }

    // --- Process Data ---

    // Helper to format comps
    const formatComps = (compsList) => {
        if (!compsList || !Array.isArray(compsList)) return [];
        return compsList.slice(0, 5).map(comp => { // increased to 5
            let displayAddress = 'Unknown Address';
            if (comp.formattedAddress) {
                displayAddress = comp.formattedAddress;
            } else if (comp.addressLine1 && comp.city) {
                displayAddress = `${comp.addressLine1}, ${comp.city}`;
            } else if (comp.address) {
                displayAddress = comp.address; 
            }

            return {
                address: displayAddress,
                price: comp.price || comp.lastSalePrice || 0, // For sales
                rent: comp.rent || comp.price || 0,           // For rentals
                distance: comp.distance ? `${comp.distance.toFixed(1)}mi` : 'N/A',
                date: comp.lastSaleDate || comp.listedDate || 'N/A',
                daysOld: comp.daysOnMarket || null
            };
        });
    };

    const arv = valueData.price || 0;
    const arvLow = valueData.priceRangeLow || arv * 0.9;
    const arvHigh = valueData.priceRangeHigh || arv * 1.1;
    
    const rent = rentData?.rent || 0;
    const rentLow = rentData?.rentRangeLow || rent * 0.9;
    const rentHigh = rentData?.rentRangeHigh || rent * 1.1;

    // Calculate a dynamic confidence score based on the spread of the range
    // Narrower range = Higher confidence.
    // E.g. Spread of 10% might be 90/100 confidence. Spread of 30% might be 70/100.
    let confidence = 85; // Default
    if (arv > 0 && arvHigh > arvLow) {
        const spreadPercent = (arvHigh - arvLow) / arv;
        // Simple linear mapping: 0% spread -> 100 conf, 40% spread -> 60 conf
        confidence = Math.max(60, Math.min(99, Math.round(100 - (spreadPercent * 100))));
    }

    return {
      success: true,
      data: {
        arv,
        arvRange: { low: arvLow, high: arvHigh },
        rentEstimate: rent,
        rentRange: { low: rentLow, high: rentHigh },
        confidenceScore: confidence,
        
        comps: formatComps(valueData.comparables), // Sales Comps
        rentComps: formatComps(rentData?.comparables), // Rent Comps
        
        // Property Details (prefer Value endpoint, fallback to Rent endpoint)
        latitude: valueData.latitude || rentData?.latitude || null,
        longitude: valueData.longitude || rentData?.longitude || null,
        lastSoldDate: valueData.lastSaleDate || 'N/A',
        yearBuilt: valueData.yearBuilt || rentData?.yearBuilt || 'N/A',
        sqft: valueData.squareFootage || rentData?.squareFootage || null,
        bedrooms: valueData.bedrooms || rentData?.bedrooms || null,
        bathrooms: valueData.bathrooms || rentData?.bathrooms || null,
        propertyType: valueData.propertyType || rentData?.propertyType || 'Single Family'
      }
    };

  } catch (error) {
    console.error("RentCast Service Error:", error);
    return { success: false, error: "Network Error: Could not reach data provider." };
  }
};
