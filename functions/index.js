const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const logger = require("firebase-functions/logger");

initializeApp();

const BASE_URL = 'https://api.rentcast.io/v1';

/**
 * Secure Proxy for RentCast API.
 * Prevents exposing the API Key to the client.
 */
exports.getPropertyData = onCall({ secrets: ["RENTCAST_API_KEY"] }, async (request) => {
  // 1. Authentication Check (Optional: Allow public if you want, but safer to require auth)
  if (!request.auth) {
     throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { address, city, state, zip } = request.data;
  
  if (!address || !city || !state) {
    throw new HttpsError('invalid-argument', 'Address, city, and state are required.');
  }

  // Access the secret key. 
  // NOTE: You must set this secret using `firebase functions:secrets:set RENTCAST_API_KEY`
  const apiKey = process.env.RENTCAST_API_KEY; 

  if (!apiKey) {
    logger.error("RentCast API Key is missing in environment variables.");
    throw new HttpsError('internal', 'Server configuration error.');
  }

  try {
    const headers = { 'X-Api-Key': apiKey, 'accept': 'application/json' };

    // 1. Fetch Value Estimate (ARV)
    const valueUrl = new URL(`${BASE_URL}/avm/value`);
    valueUrl.searchParams.append('address', address);
    valueUrl.searchParams.append('city', city);
    valueUrl.searchParams.append('state', state);
    if (zip) valueUrl.searchParams.append('zip', zip);

    const valueRes = await fetch(valueUrl, { headers });
    const valueData = await valueRes.json();

    // 2. Fetch Rent Estimate
    const rentUrl = new URL(`${BASE_URL}/avm/rent`);
    rentUrl.searchParams.append('address', address);
    rentUrl.searchParams.append('city', city);
    rentUrl.searchParams.append('state', state);
    if (zip) rentUrl.searchParams.append('zip', zip);

    const rentRes = await fetch(rentUrl, { headers });
    const rentData = await rentRes.json();

    return {
      arv: valueData,
      rent: rentData
    };

  } catch (error) {
    logger.error("RentCast API Request Failed", error);
    throw new HttpsError('internal', 'Failed to fetch property data from provider.');
  }
});