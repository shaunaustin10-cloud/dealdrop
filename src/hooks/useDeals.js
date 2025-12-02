import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { calculateDealScore } from '../utils/calculateDealScore';
import { useAuth } from '../context/AuthContext';

const appId = import.meta.env.VITE_APP_ID || 'default-app-id';

export const useDeals = () => {
  const { user } = useAuth();

  const addDeal = async (dealData) => {
    if (!user) throw new Error("User must be logged in to add a deal.");

    const { 
      address, price, rehab, arv, rent, sqft, bedrooms, bathrooms, imageUrls, notes, aiAnalysis, 
      sellerName, sellerPhone, sellerEmail, leadSource, status,
      contractPrice, assignmentFee, emd, inspectionWindow, closingDate, proofOfContractPath, hasValidContract,
      comps
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
      rent: Number(rent) || 0
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
      imageUrls: imageUrls || [],
      notes,
      aiAnalysis: aiAnalysis || null,
      sellerName: sellerName || '',
      sellerPhone: sellerPhone || '',
      sellerEmail: sellerEmail || '',
      leadSource: leadSource || 'Off-Market',
      status: status || 'New Lead',
      
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
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'deals'), newDeal);

    // 2. Auto-Publish to Public Marketplace
    const publicDeal = {
      ...newDeal,
      sellerId: user.uid,
      sellerContactEmail: user.email, 
      publishedAt: serverTimestamp(),
    };
    await addDoc(collection(db, 'artifacts', appId, 'public', 'deals'), publicDeal);
  };

  const updateDeal = async (id, dealData) => {
    if (!user) throw new Error("User must be logged in to update a deal.");

    const { 
      address, price, rehab, arv, rent, sqft, bedrooms, bathrooms, imageUrls, notes, aiAnalysis, 
      sellerName, sellerPhone, sellerEmail, leadSource, status,
      contractPrice, assignmentFee, emd, inspectionWindow, closingDate, proofOfContractPath, hasValidContract,
      comps
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
      rent: Number(rent) || 0
    });

    const updatedDeal = {
      address,
      price: Number(price) || 0,
      rehab: Number(rehab) || 0,
      effectiveRehab: effectiveRehab,
      arv: Number(arv) || 0,
      rent: Number(rent) || 0,
      sqft: Number(sqft) || 0,
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      imageUrls: imageUrls || [],
      notes,
      aiAnalysis: aiAnalysis || null,
      sellerName: sellerName || '',
      sellerPhone: sellerPhone || '',
      sellerEmail: sellerEmail || '',
      leadSource: leadSource || 'Off-Market',
      status: status || 'New Lead',

      // Assignment Details
      contractPrice: Number(contractPrice) || 0,
      assignmentFee: Number(assignmentFee) || 0,
      emd: Number(emd) || 0,
      inspectionWindow: Number(inspectionWindow) || 0,
      closingDate: closingDate || null,
      proofOfContractPath: proofOfContractPath || null,
      hasValidContract: hasValidContract || false,

      comps: comps || [],

      dealScore: score,
    };

    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'deals', id), updatedDeal);
  };

  const deleteDeal = async (id) => {
    if (!user) throw new Error("User must be logged in to delete a deal.");
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'deals', id));
  };

  const publishDeal = async (dealData) => {
      if (!user) throw new Error("User must be logged in to publish a deal.");
      
      const publicDeal = {
          ...dealData,
          sellerId: user.uid,
          sellerContactEmail: user.email, // Or fetch profile contact info
          publishedAt: serverTimestamp(),
      };

      // Public Marketplace Collection
      await addDoc(collection(db, 'artifacts', appId, 'public', 'deals'), publicDeal);
  };

  return {
    addDeal,
    updateDeal,
    deleteDeal,
    publishDeal
  };
};
