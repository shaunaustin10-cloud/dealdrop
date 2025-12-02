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
    const rentRes = await fetch(`${BASE_URL}/avm/rent?${queryParams.toString()}`, { headers });
    
    // Rent might be missing even if Value exists, so we don't hard fail
    let rentData = { rent: 0 };
    if (rentRes.ok) {
      rentData = await rentRes.json();
    }

    // Process and normalize data
    const arv = valueData.price || 0;
    const rent = rentData.rent || 0;
    const confidence = 85; 
    
    const comps = (valueData.comparables || []).slice(0, 3).map(comp => {
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
        price: comp.price || comp.lastSalePrice || 0,
        distance: comp.distance ? `${comp.distance.toFixed(1)}mi` : 'N/A'
      };
    });

    return {
      success: true,
      data: {
        arv,
        rentEstimate: rent,
        confidenceScore: confidence,
        comps: comps.length > 0 ? comps : [],
        lastSoldDate: valueData.lastSaleDate || 'N/A',
        yearBuilt: valueData.yearBuilt || 'N/A',
        sqft: valueData.squareFootage || null,
        bedrooms: valueData.bedrooms || null,
        bathrooms: valueData.bathrooms || null
      }
    };

  } catch (error) {
    console.error("RentCast Service Error:", error);
    return { success: false, error: "Network Error: Could not reach data provider." };
  }
};
