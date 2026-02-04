const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { getFirestore } = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");

/**
 * Triggered when a payment document is created by the Stripe Extension.
 * This handles the post-payment business logic:
 * 1. Verifies the payment was successful.
 * 2. Locks the deal (sets status to 'Under Contract').
 * 3. Associates the buyer with the deal.
 */
exports.onPaymentSuccess = onDocumentCreated("customers/{uid}/payments/{id}", async (event) => {
    const snap = event.data;
    if (!snap) return;
    
    const payment = snap.data();
    const userId = event.params.uid;
    const paymentId = event.params.id;

    // 1. Verify Payment Status
    if (payment.status !== 'succeeded') {
        logger.info(`Payment ${paymentId} status is '${payment.status}', ignoring.`);
        return;
    }

    // 2. Extract Metadata (dealId)
    // The Stripe extension copies session metadata to the payment document
    const dealId = payment.metadata?.dealId;
    
    if (!dealId) {
        logger.warn(`Payment ${paymentId} succeeded for user ${userId} but missing 'dealId' in metadata. Is this a subscription payment?`);
        return;
    }

    logger.info(`Processing deposit for Deal ID: ${dealId} by User: ${userId}`);

    // 3. Update Deal Status in Firestore
    const db = getFirestore();
    // Assuming 'default-app-id' for MVP. In production, pass appId in metadata.
    const appId = 'default-app-id'; 
    const dealRef = db.collection('artifacts').doc(appId).collection('publicDeals').doc(dealId);

    try {
        await db.runTransaction(async (t) => {
            const dealDoc = await t.get(dealRef);
            if (!dealDoc.exists) {
                throw new Error(`Deal ${dealId} does not exist!`);
            }

            const data = dealDoc.data();
            
            // Prevent double-booking or overwriting closed deals
            if (['Under Contract', 'Closed', 'Sold'].includes(data.status)) {
                 logger.warn(`Deal ${dealId} is already '${data.status}'. Payment ${paymentId} might need a refund.`);
                 // In a real app, you might write to a 'refunds_needed' collection here
                 return;
            }

            // Update the deal
            t.update(dealRef, {
                status: 'Under Contract',
                buyerId: userId,
                depositPaidAt: new Date(), // Firestore will convert this to Timestamp
                depositPaymentId: paymentId,
                depositAmount: (payment.amount || 0) / 100, // Stripe amounts are in cents
                // specific metadata to track who locked it
                lockedBy: userId
            });
        });
        
        logger.info(`Successfully locked Deal ${dealId} for User ${userId}`);

    } catch (error) {
        logger.error(`Failed to update deal status for ${dealId}: ${error.message}`);
    }
});
