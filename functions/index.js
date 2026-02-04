const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");
const { onPaymentSuccess } = require("./paymentHooks");

initializeApp();

exports.onPaymentSuccess = onPaymentSuccess;

const BASE_URL = 'https://api.rentcast.io/v1';

/**
 * MOCK Stripe Checkout for Local/Emulator Testing.
 * Listens for new checkout sessions and immediately provides a success URL.
 * This simulates the behavior of the "Run Payments with Stripe" extension.
 */
exports.mockStripeCheckout = onDocumentCreated("customers/{uid}/checkout_sessions/{id}", async (event) => {
    const snap = event.data;
    if (!snap) return;

    const data = snap.data();
    
    // Only run this mock if it's NOT a real Stripe session (check for existing url/error)
    if (data.url || data.error) return;

    logger.info(`[MOCK] Processing checkout session for user ${event.params.uid}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Construct a fake success URL pointing back to the app
    // We try to guess the origin or fallback to localhost
    // Ideally, the client sends 'success_url', we can just use that.
    const successUrl = data.success_url || "http://localhost:5173/dashboard?success=true";

    // Write back to the document
    return snap.ref.update({
        url: successUrl,
        mode: data.mode,
        status: 'open', // Stripe status
        created: Date.now()
    });
});

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

    logger.info("Fetching Value from:", valueUrl.toString().replace(apiKey, 'HIDDEN'));

    const valueRes = await fetch(valueUrl, { headers });
    const valueData = await valueRes.json();
    logger.info(`Value API Response: ${valueRes.status}`, valueData);

    // 2. Fetch Rent Estimate
    const rentUrl = new URL(`${BASE_URL}/avm/rent/long-term`);
    rentUrl.searchParams.append('address', address);
    rentUrl.searchParams.append('city', city);
    rentUrl.searchParams.append('state', state);
    if (zip) rentUrl.searchParams.append('zip', zip);

    logger.info("Fetching Rent from:", rentUrl.toString().replace(apiKey, 'HIDDEN'));

    const rentRes = await fetch(rentUrl, { headers });
    const rentData = await rentRes.json();
    logger.info(`Rent API Response: ${rentRes.status}`, rentData);

    return {
      arv: valueData,
      rent: rentData
    };

  } catch (error) {
    logger.error("RentCast API Request Failed", error);
    throw new HttpsError('internal', 'Failed to fetch property data from provider.');
  }
});

/**
 * Secure Proxy for Google Geocoding API.
 */
exports.getGeocode = onCall({ secrets: ["GOOGLE_MAPS_API_KEY"] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { address } = request.data;
  if (!address) {
    throw new HttpsError('invalid-argument', 'Address is required.');
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    logger.error("Google Maps API Key is missing in environment variables.");
    throw new HttpsError('internal', 'Server configuration error.');
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    } else {
      return null;
    }
  } catch (error) {
    logger.error("Geocoding API Request Failed", error);
    throw new HttpsError('internal', 'Failed to fetch geocode data.');
  }
});