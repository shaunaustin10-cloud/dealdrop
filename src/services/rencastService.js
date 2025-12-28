import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebaseConfig';

/**
 * Service for RentCast Real Estate Data API.
 * Uses Firebase Cloud Functions to securely access API.
 */

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

/**
 * Generates a consistent ID for the cache based on the address.
 * Removes non-alphanumeric characters and converts to lowercase.
 */
const generateCacheId = (addressString) => {
    return addressString.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
};

export const fetchPropertyData = async (addressString) => {
  console.log("Fetching data for:", addressString); // Debug

  // Define cache variables for saving later
  const cacheId = generateCacheId(addressString);
  const cacheRef = doc(db, 'property_cache', cacheId);

  const parsed = parseAddress(addressString);
  if (!parsed) {
    return { success: false, error: "Format Error: Please use 'Street, City, State' (e.g., 123 Main St, Dallas, TX)" };
  }

  try {
    console.log("Calling Cloud Function 'getPropertyData'...");
    const getPropertyData = httpsCallable(functions, 'getPropertyData');
    
    const result = await getPropertyData({
      address: parsed.address,
      city: parsed.city,
      state: parsed.state,
      zip: parsed.zip
    });

    const { arv: valueData, rent: rentData } = result.data;

    if (!valueData) {
        return { success: false, error: "Property not found in database." };
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

    const finalData = {
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
    };

    // Save to Cache (Only valid data)
    if (finalData.arv > 0) {
      try {
          await setDoc(cacheRef, {
              address: addressString,
              rentCastData: finalData,
              lastUpdated: serverTimestamp()
          }, { merge: true });
      } catch (e) {
          console.warn("Failed to update cache:", e);
      }
    }

    return {
      success: true,
      data: finalData
    };

  } catch (error) {
    console.error("RentCast Service Error:", error);
    if (error.code === 'permission-denied' || error.message.includes('unauthenticated')) {
        return { success: false, error: "Please sign in to access property data." };
    }
    return { success: false, error: "Network Error: Could not reach data provider." };
  }
};
