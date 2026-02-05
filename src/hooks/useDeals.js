import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp,
  onSnapshot,
  query,
  where,
  getDocs,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { calculateDealScore } from '../utils/calculateDealScore';
import { useAuth } from '../context/AuthContext';

const appId = import.meta.env.VITE_APP_ID || 'default-app-id';

export const useFetchDeals = (isPublic = false, sortBy = 'createdAt') => {
  const { user, logout } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset state on dependency change
    setLoading(true);
    setError(null);

    // If private mode and no user, we can't fetch anything.
    if (!isPublic && !user) {
      setDeals([]);
      setLoading(false);
      return;
    }

    // Determine Collection Path
    // Use optional chaining for safety, though check above should prevent issues
    const collectionPath = isPublic 
        ? `artifacts/${appId}/publicDeals`
        : `artifacts/${appId}/users/${user?.uid}/deals`;

    if (!collectionPath || (!isPublic && !user?.uid)) {
        console.warn("Invalid collection path or missing user for private deals");
        setLoading(false);
        return;
    }

    console.log(`[Fetch] Path: ${collectionPath}`);

    let q = collection(db, collectionPath);

    // Remove Firestore-side orderBy. documents missing the field are hidden by Firestore.
    // We already have robust client-side sorting in DealList.jsx.

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(`[Fetch] Received ${snapshot.size} docs from ${collectionPath}`);
      let dealsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Deduplicate by originalId (preferring the most recently updated version)
      if (isPublic) {
          const uniqueDeals = {};
          dealsData.forEach(deal => {
              const uid = deal.originalId || deal.id;
              if (!uniqueDeals[uid] || (deal.publishedAt > uniqueDeals[uid].publishedAt)) {
                  uniqueDeals[uid] = deal;
              }
          });
          dealsData = Object.values(uniqueDeals);
      }

      setDeals(dealsData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching deals:", err);
      if (err.code === 'permission-denied' || err.message.includes('permission')) {
          console.warn("Permission denied fetching deals. Logging out to clear invalid session.");
          logout();
      }
      setError(err);
      setLoading(false);
    });

    // Safety timeout: If Firestore doesn't respond in 10s, stop loading
    const timeoutId = setTimeout(() => {
        setLoading(prev => {
            if (prev) {
                console.warn("Firestore fetch timed out (10s). Checking connection...");
                setError(new Error("Request timed out. Please check your connection."));
                return false;
            }
            return prev;
        });
    }, 10000);

    return () => {
        unsubscribe();
        clearTimeout(timeoutId);
    };
  }, [isPublic, user, user?.uid, sortBy]); // Depend on user.uid, not user object

  return { deals, loading, error };
};

export const useDeals = () => {
  const { user } = useAuth();

  const addDeal = async (dealData, shouldPublish = false) => {
    if (!user) throw new Error("User must be logged in to add a deal.");

        const { 
          address, price, rehab, arv, rent, sqft, bedrooms, bathrooms, yearBuilt, imageUrls, notes, aiAnalysis, 
          sellerName, sellerPhone, sellerEmail, leadSource, status,
          contractPrice, assignmentFee, emd, inspectionWindow, closingDate, proofOfContractPath, hasValidContract,
          comps,
          propertyType, lotSqft, hasPool, occupancy,
          soldPrice // Added soldPrice
        } = dealData;
    
        // 1. Priority: AI Rehab Estimate (Legacy/Fallback)
        // 2. Fallback: User Input (with $10/sqft sanity floor)
        let effectiveRehab = Number(rehab) || 0;
        const sqftNum = Number(sqft) || 0;
        
        if (aiAnalysis && aiAnalysis.rehab && aiAnalysis.rehab.rehabEstimate && aiAnalysis.rehab.rehabEstimate.average) {
          effectiveRehab = Number(aiAnalysis.rehab.rehabEstimate.average);
        } else if (sqftNum > 0) {
          // Enforce minimum $10/sqft if relying on user input
          effectiveRehab = Math.max(effectiveRehab, sqftNum * 10);
        }
    
        // Calculate Deal Score using unified utility
        const { score } = calculateDealScore({
          price: Number(price) || 0,
          arv: Number(arv) || 0,
          rehab: effectiveRehab,
          rent: Number(rent) || 0,
          hasPool: hasPool
        });
    
        const newDeal = {
          address,
          price: Number(price) || 0,
          rehab: Number(rehab) || 0, // Store user's input
          effectiveRehab: effectiveRehab, // Store what we actually used for scoring
          arv: Number(arv) || 0,
          rent: Number(rent) || 0,
          sqft: Number(sqft) || 0,
          bedrooms: Number(bedrooms) || 0,
          bathrooms: Number(bathrooms) || 0,
          yearBuilt: Number(yearBuilt) || 0,
          imageUrls: imageUrls || [],      notes,
      aiAnalysis: aiAnalysis || null,
      sellerName: sellerName || '',
      sellerPhone: sellerPhone || '',
      sellerEmail: sellerEmail || '',
      leadSource: leadSource || 'Off-Market',
      status: status || 'New Lead',
      
      propertyType: propertyType || 'Single Family',
      lotSqft: Number(lotSqft) || 0,
      hasPool: hasPool === true || hasPool === 'true',
      occupancy: occupancy || 'Vacant',
      soldPrice: Number(soldPrice) || 0, // Added soldPrice

      // Assignment Details
      contractPrice: Number(contractPrice) || 0,
      assignmentFee: Number(assignmentFee) || 0,
      emd: Number(emd) || 0,
      inspectionWindow: Number(inspectionWindow) || 0,
      closingDate: closingDate || null,
      proofOfContractPath: proofOfContractPath || null,
      hasValidContract: hasValidContract || false,
      
      comps: comps || [], // Store user-provided comps

      createdAt: serverTimestamp(),
      createdBy: user.uid, // Security: Track ownership
      dealScore: score,
    };

    // 1. Private User Collection
    const docRef = await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'deals'), newDeal);

    // 2. Conditionally Publish to Public Marketplace
    if (shouldPublish) {
       await publishDeal({ ...newDeal, originalId: docRef.id });
    }
    
    return docRef.id;
  };

  const updateDeal = async (id, dealData, shouldPublish = false) => {
    if (!user) throw new Error("User must be logged in to update a deal.");

    const { 
      price, rehab, arv, rent, sqft, bedrooms, bathrooms, yearBuilt, aiAnalysis, hasPool
    } = dealData;
      
    // --- Smart Scoring Logic (Update) ---
    let effectiveRehab = Number(rehab) || 0;
    const sqftNum = Number(sqft) || 0;

    if (aiAnalysis && aiAnalysis.rehab && aiAnalysis.rehab.rehabEstimate && aiAnalysis.rehab.rehabEstimate.average) {
      effectiveRehab = Number(aiAnalysis.rehab.rehabEstimate.average);
    } else if (sqftNum > 0) {
      effectiveRehab = Math.max(effectiveRehab, sqftNum * 10);
    }

    // Calculate Deal Score using unified utility
    const { score } = calculateDealScore({
      price: Number(price) || 0,
      arv: Number(arv) || 0,
      rehab: effectiveRehab,
      rent: Number(rent) || 0,
      hasPool: hasPool
    });

    const updatedDeal = {
      ...dealData, // Preserve all form fields including lat, lng, etc.
      price: Number(price) || 0,
      rehab: Number(rehab) || 0,
      effectiveRehab: effectiveRehab,
      arv: Number(arv) || 0,
      rent: Number(rent) || 0,
      sqft: Number(sqft) || 0,
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      yearBuilt: Number(yearBuilt) || 0,
      dealScore: score,
    };

    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'deals', id), updatedDeal);

    if (shouldPublish) {
        await publishDeal({ ...updatedDeal, originalId: id });
    }
  };

  const deleteDeal = async (id) => {
    if (!user) throw new Error("User must be logged in to delete a deal.");
    
    // 1. Delete from Private Collection
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'deals', id));

    // 2. Delete from Public Marketplace (if it exists)
    // Try deleting by same ID (if created via new logic where ID matches)
    try {
        await deleteDoc(doc(db, 'artifacts', appId, 'publicDeals', id));
    } catch (e) {
        // Ignore if not found
    }

    // 3. Fallback: Query for originalId (handles legacy IDs)
    try {
        const q = query(
            collection(db, 'artifacts', appId, 'publicDeals'), 
            where("originalId", "==", id)
        );
        const snap = await getDocs(q);
        snap.forEach(async (d) => {
            await deleteDoc(d.ref);
        });
    } catch (e) {
        console.error("Error checking public deals for deletion:", e);
    }
  };

  const getDealById = async (id) => {
    // 1. Try Public Collection
    try {
      const publicRef = doc(db, 'artifacts', appId, 'publicDeals', id);
      const publicSnap = await getDoc(publicRef);
      if (publicSnap.exists()) {
        return { id: publicSnap.id, ...publicSnap.data(), isPublic: true };
      }
    } catch (e) {
      console.warn("Public fetch failed", e);
    }

    // 2. Try Private Collection if user is logged in
    if (user) {
      try {
        const privateRef = doc(db, 'artifacts', appId, 'users', user.uid, 'deals', id);
        const privateSnap = await getDoc(privateRef);
        if (privateSnap.exists()) {
          return { id: privateSnap.id, ...privateSnap.data(), isPublic: false };
        }
      } catch (e) {
        console.warn("Private fetch failed", e);
      }
    }

    return null;
  };

  const publishDeal = async (dealData) => {
      if (!user) throw new Error("User must be logged in to publish a deal.");
      
      console.log(`[Publish] Starting for: ${dealData.originalId}`);

      const publicDeal = {
          ...dealData,
          sellerId: user.uid,
          sellerContactEmail: user.email, 
          publishedAt: serverTimestamp(),
          isVerified: !!dealData.proofOfContractPath,
          adminVerificationStatus: (dealData.dealScore >= 84) ? 'pending' : 'auto-approved'
      };

      if (!dealData.originalId) throw new Error("Missing originalId");

      try {
          // 1. Check if a document already exists with this originalId field (handles legacy random IDs)
          const q = query(
            collection(db, 'artifacts', appId, 'publicDeals'), 
            where("originalId", "==", dealData.originalId)
          );
          const snap = await getDocs(q);

          if (!snap.empty) {
              // Update the EXISTING document (regardless of its Doc ID)
              const existingDocRef = doc(db, 'artifacts', appId, 'publicDeals', snap.docs[0].id);
              await setDoc(existingDocRef, publicDeal, { merge: true });
              console.log(`[Publish] Updated existing doc: ${snap.docs[0].id}`);
          } else {
              // Create a NEW document using the originalId as the Doc ID
              const newDocRef = doc(db, 'artifacts', appId, 'publicDeals', dealData.originalId);
              await setDoc(newDocRef, publicDeal);
              console.log(`[Publish] Created new doc with ID: ${dealData.originalId}`);
          }
      } catch (err) {
          console.error("[Publish] Error:", err);
          throw err;
      }
  };

  return {
    addDeal,
    updateDeal,
    deleteDeal,
    getDealById,
    publishDeal
  };
};
