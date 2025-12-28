import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Search, Loader2, Calculator, FileText, Target, DollarSign, Settings } from 'lucide-react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { httpsCallable } from 'firebase/functions';
import ImageUploader from './ImageUploader';
import InputField from './InputField';
import DealAnalysis from './DealAnalysis';
import { fetchPropertyData } from '../services/rencastService';
import { analyzeDeal } from '../services/geminiService';
import { decrementUserCredits } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { functions, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const REHAB_LEVELS = {
  LIGHT: { label: 'Light ($20/sqft)', cost: 20 },
  STANDARD: { label: 'Standard ($40/sqft)', cost: 40 },
  HEAVY: { label: 'Heavy ($70/sqft)', cost: 70 }
};

const libraries = ['places'];
const appId = import.meta.env.VITE_APP_ID || 'default-app-id';
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Helper function to get Google Static Map URL (Satellite/Hybrid)
const getGoogleStaticMapUrl = (lat, lng, address) => {
  const API_KEY = GOOGLE_MAPS_API_KEY;
  if (!API_KEY) return '';

  const location = lat && lng ? `${lat},${lng}` : encodeURIComponent(address);
  if (!location) return '';

  return `https://maps.googleapis.com/maps/api/staticmap?center=${location}&zoom=19&size=600x400&maptype=hybrid&markers=color:red|${location}&key=${API_KEY}`;
};

// Helper to geocode address if RentCast fails (via Cloud Function)
const geocodeAddress = async (address) => {
  try {
    const getGeocode = httpsCallable(functions, 'getGeocode');
    const result = await getGeocode({ address });
    return result.data;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

const AddDealModal = ({ isOpen, onClose, onAdd, initialData, onUpdate, onUpgrade }) => {
  const { user } = useAuth();
  const { isPro, credits } = useSubscription();
  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState({
    address: '', price: '', arv: '', rehab: '', rent: '', sqft: '', bedrooms: '', bathrooms: '', imageUrls: [], notes: '', aiAnalysis: null,
    sellerName: '', sellerPhone: '', sellerEmail: '', leadSource: 'Off-Market', status: 'New Lead',
    lat: null, lng: null,
    // New Fields
    propertyType: 'Single Family', lotSqft: '', hasPool: 'false', occupancy: 'Vacant',
    // Role Specific
    contractPrice: '', assignmentFee: '', emd: '', inspectionWindow: '', closingDate: '',
    commissionPct: '3', miscClosingCosts: '0',
    mortgagePayoff: '', taxProrations: '',
    // Financing Defaults
    financing: {
        loanType: 'hardmoney', // cash, hardmoney, dscr
        interestRate: '12',
        points: '2',
        holdTime: '6',
        buyClosingCosts: '0',
        sellClosingCostsPct: '6'
    }
  });
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [generatedMapImageUrl, setGeneratedMapImageUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [fetchingMarket, setFetchingMarket] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [rehabLevel, setRehabLevel] = useState(null);
  
  // State
  const [isAssignment, setIsAssignment] = useState(false);
  const [postToMarketplace, setPostToMarketplace] = useState(false);
  const [comps, setComps] = useState([]);
  const [newComp, setNewComp] = useState({ address: '', soldPrice: '', link: '' });
  const [showFinancing, setShowFinancing] = useState(false);
  const [analysisMode, setAnalysisMode] = useState('investor'); // 'agent' or 'investor'

  // Fetch User Profile Role
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !isOpen) return;
      try {
        const docRef = doc(db, 'artifacts', appId, 'profiles', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const profile = docSnap.data();
          setUserProfile(profile);
          
          // Set default mode based on role or existing data
          if (initialData && initialData.roleAtCreation) {
              setAnalysisMode(initialData.roleAtCreation);
          } else {
              setAnalysisMode(profile.role || 'investor');
          }
        }
      } catch (e) {
        console.warn("Could not fetch profile for modal logic", e);
      }
    };
    fetchProfile();
  }, [user, isOpen, initialData]);

  // Google Maps Autocomplete
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libraries
  });
  const [autocomplete, setAutocomplete] = useState(null);

  const onAutocompleteLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = async () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      
      if (place.formatted_address) {
        let lat = place.geometry?.location?.lat();
        let lng = place.geometry?.location?.lng();

        if (!lat || !lng) {
            const cloudCoords = await geocodeAddress(place.formatted_address);
            if (cloudCoords) {
                lat = cloudCoords.lat;
                lng = cloudCoords.lng;
            }
        }

        setFormData(prev => ({
          ...prev,
          address: place.formatted_address,
          lat: lat,
          lng: lng
        }));
      }
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        address: initialData.address || '',
        price: initialData.price || '',
        arv: initialData.arv || '',
        rehab: initialData.rehab || '',
        rent: initialData.rent || '',
        sqft: initialData.sqft || '',
        bedrooms: initialData.bedrooms || '',
        bathrooms: initialData.bathrooms || '',
        imageUrls: initialData.imageUrls || [],
        notes: initialData.notes || '',
        aiAnalysis: initialData.aiAnalysis || null,
        sellerName: initialData.sellerName || '',
        sellerPhone: initialData.sellerPhone || '',
        sellerEmail: initialData.sellerEmail || '',
        leadSource: initialData.leadSource || 'Off-Market',
        status: initialData.status || 'New Lead',
        lat: initialData.lat || null,
        lng: initialData.lng || null,
        propertyType: initialData.propertyType || 'Single Family',
        lotSqft: initialData.lotSqft || '',
        hasPool: initialData.hasPool ? 'true' : 'false',
        occupancy: initialData.occupancy || 'Vacant',
        contractPrice: initialData.contractPrice || '',
        assignmentFee: initialData.assignmentFee || '',
        emd: initialData.emd || '',
        inspectionWindow: initialData.inspectionWindow || '',
        closingDate: initialData.closingDate || '',
        commissionPct: initialData.commissionPct || '3',
        miscClosingCosts: initialData.miscClosingCosts || '0',
        mortgagePayoff: initialData.mortgagePayoff || '',
        taxProrations: initialData.taxProrations || '',
        financing: initialData.financing || {
            loanType: 'hardmoney',
            interestRate: '12',
            points: '2',
            holdTime: '6',
            buyClosingCosts: '0',
            sellClosingCostsPct: '6'
        }
      });
      setIsAssignment(initialData.hasValidContract || false);
      setComps(initialData.comps || []);
    } else {
      setFormData({
        address: '', price: '', arv: '', rehab: '', rent: '', sqft: '', bedrooms: '', bathrooms: '', imageUrls: [], notes: '', aiAnalysis: null,
        sellerName: '', sellerPhone: '', sellerEmail: '', leadSource: 'Off-Market', status: 'New Lead',
        lat: null, lng: null,
        propertyType: 'Single Family', lotSqft: '', hasPool: 'false', occupancy: 'Vacant',
        contractPrice: '', assignmentFee: '', emd: '', inspectionWindow: '', closingDate: '',
        commissionPct: '3', miscClosingCosts: '0',
        mortgagePayoff: '', taxProrations: '',
        financing: {
            loanType: 'hardmoney',
            interestRate: '12',
            points: '2',
            holdTime: '6',
            buyClosingCosts: '0',
            sellClosingCostsPct: '6'
        }
      });
      setIsAssignment(false);
      setComps([]);
    }
    setTempImageUrl('');
    setFetchError('');
    setRehabLevel(null);
    setPostToMarketplace(false);
    setNewComp({ address: '', soldPrice: '', link: '' });
  }, [initialData, isOpen]);

  // Auto-calculate rehab when level or sqft changes
  useEffect(() => {
    if (rehabLevel && formData.sqft) {
      const sqft = Number(formData.sqft);
      if (!isNaN(sqft) && sqft > 0) {
        const costPerSqft = REHAB_LEVELS[rehabLevel].cost;
        setFormData(prev => ({ ...prev, rehab: (sqft * costPerSqft).toString() }));
      }
    }
  }, [rehabLevel, formData.sqft]);

  // Auto-calculate Total Price for Assignments
  useEffect(() => {
    if (isAssignment) {
        const cPrice = parseFloat(formData.contractPrice) || 0;
        const aFee = parseFloat(formData.assignmentFee) || 0;
        if (cPrice > 0 || aFee > 0) {
            setFormData(prev => ({ ...prev, price: (cPrice + aFee).toString() }));
        }
    }
  }, [isAssignment, formData.contractPrice, formData.assignmentFee]);

  // Effect to generate map image URL
  useEffect(() => {
    if (isOpen && (formData.address || (formData.lat && formData.lng))) {
      const url = getGoogleStaticMapUrl(formData.lat, formData.lng, formData.address);
      setGeneratedMapImageUrl(url);
    } else if (!isOpen) {
      setGeneratedMapImageUrl('');
    }
  }, [isOpen, formData.address, formData.lat, formData.lng]);

  if (!isOpen) return null;

  const handleAddComp = () => {
    if (!newComp.address || !newComp.soldPrice) {
        alert("Address and Sold Price are required for a comp.");
        return;
    }
    setComps([...comps, newComp]);
    setNewComp({ address: '', soldPrice: '', link: '' });
  };

  const handleRemoveComp = (index) => {
    setComps(comps.filter((_, i) => i !== index));
  };

  const handleFetchMarketData = async () => {
    setFetchError('');
    if (!formData.address) {
      setFetchError('Please enter an address first.');
      return;
    }

    if (!isPro) {
        if (credits <= 0) {
            setFetchError("You have 0 credits left. Upgrade to Pro for unlimited access.");
            if (onUpgrade) setTimeout(onUpgrade, 1500);
            return;
        }
        const success = await decrementUserCredits(user.uid);
        if (!success) {
             setFetchError("Error processing credit. Please try again.");
             return;
        }
    }

    setFetchingMarket(true);
    try {
      const rencastData = await fetchPropertyData(formData.address);

      let updates = {};
      let newAiAnalysis = { ...formData.aiAnalysis, timestamp: new Date().toISOString() };

      if (rencastData.success) {
        updates.arv = rencastData.data.arv;
        updates.rent = rencastData.data.rentEstimate;
        updates.sqft = rencastData.data.sqft || formData.sqft;
        updates.bedrooms = rencastData.data.bedrooms || formData.bedrooms;
        updates.bathrooms = rencastData.data.bathrooms || formData.bathrooms;
        updates.lat = rencastData.data.latitude;
        updates.lng = rencastData.data.longitude;
        
        newAiAnalysis.market = rencastData.data;
      } else {
         setFetchError(rencastData.error || 'Market data fetch failed. Attempting to geocode...');
      }

      if (!updates.lat || !updates.lng) {
          const geoData = await geocodeAddress(formData.address);
          if (geoData) {
              updates.lat = geoData.lat;
              updates.lng = geoData.lng;
              if (!rencastData.success) setFetchError('Market data unavailable, but location found.');
          }
      }

      setFormData(prev => ({
        ...prev,
        ...updates,
        aiAnalysis: newAiAnalysis
      }));

    } catch (e) {
      console.error("Market Analysis error:", e);
      setFetchError('Analysis failed. Please try again.');
    } finally {
      setFetchingMarket(false);
    }
  };

  const handleAnalyzeDeal = async () => {
      if (!formData.price || !formData.arv) {
          setFetchError('Please enter Price and ARV to analyze.');
          return;
      }
      
      setAnalyzing(true);
      setFetchError('');

      try {
          const result = await analyzeDeal(formData);
          if (result.success) {
              setFormData(prev => ({
                  ...prev,
                  aiAnalysis: {
                      ...prev.aiAnalysis,
                      gemini: result.data
                  }
              }));
          } else {
              setFetchError(result.error);
          }
      } catch {
          setFetchError('AI Analysis failed.');
      } finally {
          setAnalyzing(false);
      }
  };

  // Logic for Agent vs Investor Mode
  const isAgentMode = analysisMode === 'agent';

  // Live Result Preview Logic (Best Practice: As-Is vs Renovated Scenarios)
  const calculateLiveResult = () => {
      const p = parseFloat(formData.price) || 0;
      const a = parseFloat(formData.arv) || 0;
      const r = parseFloat(formData.rehab) || 0;
      
      if (isAgentMode) {
          const mortgage = parseFloat(formData.mortgagePayoff) || 0;
          const taxes = parseFloat(formData.taxProrations) || 0;
          const commPct = parseFloat(formData.commissionPct) || 0;
          const clos = parseFloat(formData.miscClosingCosts) || 0;

          const asIsComm = p * (commPct / 100);
          const asIsNet = p - asIsComm - clos - mortgage - taxes;

          const renComm = a * (commPct / 100);
          const renovatedNet = a - renComm - clos - r - mortgage - taxes;

          return { asIs: asIsNet, renovated: renovatedNet };
      }

      // Investor / Flip Calculation
      // Costs
      const buyClosing = parseFloat(formData.financing?.buyClosingCosts) || 0;
      const sellClosing = a * ((parseFloat(formData.financing?.sellClosingCostsPct) || 0) / 100);
      
      // Loan Costs
      let loanAmount = 0;
      if (formData.financing?.loanType === 'hardmoney') {
          loanAmount = p + r; // Usually funds purchase + rehab
      } else if (formData.financing?.loanType === 'dscr') {
           loanAmount = p * 0.80; // Typical 80 LTV
      }
      // Cash = 0 loan amount for interest calc, but full cash deployment

      const pointsCost = loanAmount * ((parseFloat(formData.financing?.points) || 0) / 100);
      const annualInterest = loanAmount * ((parseFloat(formData.financing?.interestRate) || 0) / 100);
      const holdTimeMonths = parseFloat(formData.financing?.holdTime) || 0;
      const interestCost = (annualInterest / 12) * holdTimeMonths;

      const totalCosts = r + buyClosing + sellClosing + pointsCost + interestCost;
      const netProfit = a - p - totalCosts;

      return { total: netProfit, totalCosts };
  };
  const liveResult = calculateLiveResult();


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Role-based result calculation
    const priceNum = parseFloat(formData.price) || 0;
    const arvNum = parseFloat(formData.arv) || 0;
    const rehabNum = parseFloat(formData.rehab) || 0;
    const commissionPctNum = parseFloat(formData.commissionPct) || 0;
    const closingCostsNum = parseFloat(formData.miscClosingCosts) || 0;
    const mortgageNum = parseFloat(formData.mortgagePayoff) || 0;
    const taxesNum = parseFloat(formData.taxProrations) || 0;

    let projectedResult = 0;
    let resultLabel = '';

    if (isAgentMode) {
        // Use the renovated scenario as the default saved projection
        const comm = arvNum * (commissionPctNum / 100);
        projectedResult = arvNum - comm - closingCostsNum - rehabNum - mortgageNum - taxesNum;
        resultLabel = 'Est. Seller Net (Renovated)';
    } else {
        projectedResult = liveResult.total;
        resultLabel = 'Est. Net Profit';
    }

    let finalFormData = { 
        ...formData, 
        comps,
        projectedResult,
        resultLabel,
        mortgagePayoff: mortgageNum,
        taxProrations: taxesNum,
        roleAtCreation: analysisMode
    };
    finalFormData.hasValidContract = isAssignment;

    if (generatedMapImageUrl && finalFormData.imageUrls.length === 0) {
        finalFormData.imageUrls = [generatedMapImageUrl];
    }

    if (tempImageUrl && !finalFormData.imageUrls.includes(tempImageUrl)) {
      finalFormData.imageUrls = [...finalFormData.imageUrls, tempImageUrl];
    }

    if (initialData) {
      onUpdate(initialData.id, finalFormData);
    } else {
      onAdd(finalFormData, postToMarketplace);
    }
    setTempImageUrl('');
    setNewComp({ address: '', soldPrice: '', link: '' });
    setComps([]);
    setPostToMarketplace(false);
    onClose();
  };

  const modalTitle = initialData ? "Edit Analysis" : "Analyze New Deal";
  const buttonText = initialData ? "Update Analysis" : "Save Analysis";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center flex-shrink-0">
          <div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white">{modalTitle}</h3>
             <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Enter property details to generate a validation report.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"><X size={20} /></button>
        </div>
        
        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">

           {/* Agent Mode Toggle */}
           {userProfile?.role === 'agent' && (
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 border border-slate-200 dark:border-slate-700">
                 <button
                    type="button"
                    onClick={() => setAnalysisMode('agent')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${analysisMode === 'agent' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                 >
                    <Target size={16} /> Listing Agent
                 </button>
                 <button
                    type="button"
                    onClick={() => setAnalysisMode('investor')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${analysisMode === 'investor' ? 'bg-emerald-500 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                 >
                    <DollarSign size={16} /> Investor / Buyer
                 </button>
              </div>
           )}
           
           {/* Toggle Deal Type (Investor Only) */}
           {!isAgentMode && (
             <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
               <button 
                  type="button"
                  onClick={() => setIsAssignment(false)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isAssignment ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
               >
                  Flip / BRRRR
               </button>
               <button 
                  type="button"
                  onClick={() => setIsAssignment(true)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isAssignment ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
               >
                  Wholesale
               </button>
             </div>
           )}

           {isAgentMode && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 p-3 rounded-xl flex items-center gap-3 mb-6">
                 <div className="bg-blue-500 p-2 rounded-lg text-white">
                    <Target size={20} />
                 </div>
                 <div>
                    <p className="text-slate-900 dark:text-white font-bold text-sm">Real Estate Agent Mode</p>
                    <p className="text-blue-600 dark:text-blue-400 text-[10px] uppercase font-black tracking-widest">Listing Analysis Active</p>
                 </div>
              </div>
           )}

           <div className="grid grid-cols-2 gap-3 mb-6 sticky top-0 z-10 bg-white dark:bg-slate-900 pb-2">
                <div className="flex flex-col gap-1">
                    <button 
                        type="button" 
                        onClick={handleFetchMarketData}
                        disabled={fetchingMarket}
                        className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                        {fetchingMarket ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                        {fetchingMarket ? 'Fetching...' : '1. Fetch Data'}
                    </button>
                    {!isPro && (
                        <p className="text-[9px] text-center text-slate-500 uppercase font-bold tracking-tighter">Cost: 1 Credit ({credits} Left)</p>
                    )}
                </div>
                <button 
                    type="button" 
                    onClick={handleAnalyzeDeal}
                    disabled={analyzing || !formData.price || !formData.arv}
                    className={`font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border ${
                        analyzing || !formData.price || !formData.arv 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent hover:shadow-lg hover:shadow-indigo-500/20'
                    }`}
                >
                    {analyzing ? <Loader2 className="animate-spin" size={18} /> : <Calculator size={18} />}
                    {analyzing ? 'Analyzing...' : '2. AI Analyze'}
                </button>
           </div>

           {fetchError && <p className="text-red-400 text-xs text-center mb-4">{fetchError}</p>}

           {formData.aiAnalysis && (
             <div className="mb-6">
               <DealAnalysis deal={formData} />
             </div>
           )}

           <form id="deal-form" onSubmit={handleSubmit} className="space-y-4">

             <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Property Type</label>
                  <select 
                    value={formData.propertyType}
                    onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="Single Family">Single Family</option>
                    <option value="Duplex">Duplex</option>
                    <option value="Triplex">Triplex</option>
                    <option value="Fourplex">Fourplex</option>
                    <option value="5 Units+">5 Units+</option>
                    <option value="Townhouse or Condo">Townhouse or Condo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Occupancy Status</label>
                  <select 
                    value={formData.occupancy}
                    onChange={(e) => setFormData({...formData, occupancy: e.target.value})}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="Vacant">Vacant</option>
                    <option value="Occupied">Occupied</option>
                  </select>
                </div>
             </div>
             
             <div className="mb-4">
               <label className="block text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Address</label>
               {isLoaded ? (
                  <Autocomplete
                    onLoad={onAutocompleteLoad}
                    onPlaceChanged={onPlaceChanged}
                  >
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="123 Main St, City, State"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-3 pr-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </Autocomplete>
               ) : (
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Loading Maps..."
                    disabled
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-3 pr-3 text-slate-400 dark:text-slate-500 cursor-wait"
                  />
               )}
             </div>

            {/* Role-Specific Secondary Fields */}
            {isAgentMode ? (
               <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 p-4 rounded-xl space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                     <FileText size={18} />
                     <h4 className="text-sm font-bold uppercase tracking-wider">Listing Net Sheet Details</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <InputField 
                       label="Listing Commission" 
                       type="number" 
                       value={formData.commissionPct} 
                       onChange={v => setFormData({...formData, commissionPct: v})} 
                       suffix="%" 
                     />
                     <InputField 
                       label="Misc Closing Costs" 
                       type="number" 
                       value={formData.miscClosingCosts} 
                       onChange={v => setFormData({...formData, miscClosingCosts: v})} 
                       prefix="$" 
                     />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <InputField 
                       label="Mortgage Payoff" 
                       type="number" 
                       value={formData.mortgagePayoff} 
                       onChange={v => setFormData({...formData, mortgagePayoff: v})} 
                       prefix="$" 
                     />
                     <InputField 
                       label="Tax Prorations (Est)" 
                       type="number" 
                       value={formData.taxProrations} 
                       onChange={v => setFormData({...formData, taxProrations: v})} 
                       prefix="$" 
                     />
                  </div>
                  <p className="text-[10px] text-blue-600/60 dark:text-blue-400/60 mt-1">
                    *Comprehensive seller net sheet calculation.
                  </p>
               </div>
            ) : (
               isAssignment ? (
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-500/30 p-4 rounded-xl space-y-4 animate-fade-in">
                     <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                        <FileText size={18} />
                        <h4 className="text-sm font-bold uppercase tracking-wider">Wholesale Details</h4>
                     </div>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField 
                          label="Contract Price" 
                          type="number" 
                          value={formData.contractPrice} 
                          onChange={v => setFormData({...formData, contractPrice: v})} 
                          prefix="$" 
                          placeholder="Original Price"
                        />
                        <InputField 
                          label="Assignment Fee" 
                          type="number" 
                          value={formData.assignmentFee} 
                          onChange={v => setFormData({...formData, assignmentFee: v})} 
                          prefix="$" 
                          placeholder="Your Fee"
                        />
                     </div>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="EMD Required" type="number" value={formData.emd} onChange={v => setFormData({...formData, emd: v})} prefix="$" />
                        <InputField label="Insp. Window (Days)" type="number" value={formData.inspectionWindow} onChange={v => setFormData({...formData, inspectionWindow: v})} />
                     </div>
                     
                     <InputField 
                       label="Closing Date" 
                       type="date" 
                       value={formData.closingDate} 
                       onChange={v => setFormData({...formData, closingDate: v})} 
                     />
                  </div>
               ) : (
                   /* Investor Financing Section */
                   <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl space-y-4 animate-fade-in">
                       <button 
                           type="button"
                           onClick={() => setShowFinancing(!showFinancing)}
                           className="flex items-center justify-between w-full text-left"
                       >
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                <DollarSign size={18} />
                                <h4 className="text-sm font-bold uppercase tracking-wider">Financing & Holding Costs</h4>
                            </div>
                            <Settings size={16} className={`text-slate-400 transition-transform ${showFinancing ? 'rotate-180' : ''}`} />
                       </button>

                       {showFinancing && (
                           <div className="space-y-4 pt-2">
                               <div className="grid grid-cols-3 gap-2">
                                   <div className="col-span-3 sm:col-span-1">
                                      <label className="block text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Loan Type</label>
                                      <select 
                                        value={formData.financing.loanType}
                                        onChange={(e) => setFormData({...formData, financing: {...formData.financing, loanType: e.target.value}})}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-2 text-slate-900 dark:text-white text-sm"
                                      >
                                          <option value="cash">Cash</option>
                                          <option value="hardmoney">Hard Money</option>
                                          <option value="dscr">DSCR Loan</option>
                                      </select>
                                   </div>
                                   <InputField 
                                        label="Int. Rate" 
                                        value={formData.financing.interestRate} 
                                        onChange={v => setFormData({...formData, financing: {...formData.financing, interestRate: v}})} 
                                        suffix="%" 
                                        disabled={formData.financing.loanType === 'cash'}
                                   />
                                   <InputField 
                                        label="Points" 
                                        value={formData.financing.points} 
                                        onChange={v => setFormData({...formData, financing: {...formData.financing, points: v}})} 
                                        suffix="pts" 
                                        disabled={formData.financing.loanType === 'cash'}
                                   />
                               </div>
                               <div className="grid grid-cols-3 gap-2">
                                    <InputField 
                                        label="Hold Time" 
                                        value={formData.financing.holdTime} 
                                        onChange={v => setFormData({...formData, financing: {...formData.financing, holdTime: v}})} 
                                        suffix="mo" 
                                   />
                                   <InputField 
                                        label="Buy Costs" 
                                        value={formData.financing.buyClosingCosts} 
                                        onChange={v => setFormData({...formData, financing: {...formData.financing, buyClosingCosts: v}})} 
                                        prefix="$" 
                                   />
                                   <InputField 
                                        label="Sell Costs" 
                                        value={formData.financing.sellClosingCostsPct} 
                                        onChange={v => setFormData({...formData, financing: {...formData.financing, sellClosingCostsPct: v}})} 
                                        suffix="%" 
                                   />
                               </div>
                           </div>
                       )}
                   </div>
               )
            )}

            {/* Live Result Preview */}
            <div className={`p-4 rounded-xl border mb-6 ${isAgentMode ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'}`}>
                {isAgentMode ? (
                    <div className="grid grid-cols-2 gap-4 divide-x divide-blue-200 dark:divide-blue-500/20">
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase font-black tracking-widest text-blue-600 dark:text-blue-400 mb-1">Estimated As-Is Net</span>
                            <span className="text-xl font-black text-slate-900 dark:text-white">${Math.round(liveResult.asIs).toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col pl-4">
                            <span className="text-[9px] uppercase font-black tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Renovated Net (ARV)</span>
                            <span className="text-xl font-black text-slate-900 dark:text-white">${Math.round(liveResult.renovated).toLocaleString()}</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center w-full">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 dark:text-emerald-400">Est. Net Profit (ROI: {liveResult.totalCosts > 0 ? Math.round((liveResult.total / (parseFloat(formData.price || 0) + parseFloat(formData.rehab || 0) + liveResult.totalCosts)) * 100) : 0}%)</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">${Math.round(liveResult.total).toLocaleString()}</span>
                            <span className="text-[9px] text-slate-400">Costs: ${Math.round(liveResult.totalCosts).toLocaleString()}</span>
                        </div>
                        <div className="bg-emerald-500 p-2 rounded-lg text-white">
                            <Calculator size={24} />
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <InputField 
                 label={isAgentMode ? "Suggested List Price" : (isAssignment ? "Total Buy Price" : "Purchase Price")} 
                 type="number" 
                 value={formData.price} 
                 onChange={v => setFormData({...formData, price: v})} 
                 prefix="$" 
                 disabled={isAssignment && !isAgentMode} 
               />
               <InputField label="Rehab Est." type="number" value={formData.rehab} onChange={v => setFormData({...formData, rehab: v})} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <InputField label="ARV" type="number" value={formData.arv} onChange={v => setFormData({...formData, arv: v})} prefix="$" />
               <InputField label="Est. Rent" type="number" value={formData.rent} onChange={v => setFormData({...formData, rent: v})} prefix="$" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <InputField label="Bedrooms" type="number" value={formData.bedrooms} onChange={v => setFormData({...formData, bedrooms: v})} />
              <InputField label="Bathrooms" type="number" value={formData.bathrooms} onChange={v => setFormData({...formData, bathrooms: v})} />
              <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Pool?</label>
                  <select
                      value={formData.hasPool}
                      onChange={(e) => setFormData({...formData, hasPool: e.target.value})}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                  </select>
              </div>
            </div>
            
             <div className="grid grid-cols-2 gap-4">
              <InputField label="Building Sqft" type="number" value={formData.sqft} onChange={v => setFormData({...formData, sqft: v})} suffix="sqft" />
              <InputField label="Lot Sqft" type="number" value={formData.lotSqft} onChange={v => setFormData({...formData, lotSqft: v})} suffix="sqft" />
            </div>

            <div className="mb-4">
                  <label className="block text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Rehab Level (Auto-Calc)</label>
                  <div className="flex gap-1 bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                    {Object.keys(REHAB_LEVELS).map(level => (
                        <button
                            key={level}
                            type="button"
                            onClick={() => setRehabLevel(level)}
                            className={`flex-1 py-2 text-xs font-bold rounded ${rehabLevel === level ? 'bg-emerald-500 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            title={REHAB_LEVELS[level].label}
                        >
                            {level[0]} ({REHAB_LEVELS[level].cost}/sf)
                        </button>
                    ))}
                  </div>
            </div>

            {/* Comps Section */}
            <div className="bg-white dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
               <div className="flex justify-between items-center">
                  <h4 className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">Market Comps (Optional)</h4>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-7 gap-2 items-end">
                  <div className="md:col-span-3">
                     <label className="block text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold mb-1">Comp Address</label>
                     {isLoaded ? (
                        <Autocomplete
                            onLoad={(ref) => (window.compAutocomplete = ref)}
                            onPlaceChanged={() => {
                                const place = window.compAutocomplete.getPlace();
                                if (place.formatted_address) {
                                    setNewComp(prev => ({ ...prev, address: place.formatted_address }));
                                }
                            }}
                        >
                            <input
                                type="text"
                                value={newComp.address}
                                onChange={(e) => setNewComp({...newComp, address: e.target.value})}
                                placeholder="123 Nearby St"
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                            />
                        </Autocomplete>
                     ) : (
                        <input
                            type="text"
                            disabled
                            placeholder="Loading..."
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-slate-400 text-sm"
                        />
                     )}
                  </div>
                  <div className="md:col-span-2">
                     <InputField 
                        label="Sold Price" 
                        type="number"
                        value={newComp.soldPrice} 
                        onChange={(v) => setNewComp({...newComp, soldPrice: v})} 
                        prefix="$"
                     />
                  </div>
                  <div className="md:col-span-2">
                    <button 
                      type="button"
                      onClick={handleAddComp}
                      className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold py-2.5 rounded-lg text-sm transition-colors border border-slate-300 dark:border-slate-600"
                    >
                      + Add Comp
                    </button>
                  </div>
               </div>
               <div className="col-span-full">
                 <InputField 
                    label="Link (Zillow/Redfin)" 
                    value={newComp.link} 
                    onChange={(v) => setNewComp({...newComp, link: v})} 
                    placeholder="https://zillow.com/..."
                 />
               </div>

               {comps.length > 0 && (
                 <div className="space-y-2 mt-2">
                    {comps.map((comp, index) => (
                       <div key={index} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 text-xs">
                          <div className="flex-1 truncate pr-2">
                             <span className="text-slate-900 dark:text-white font-medium block">{comp.address}</span>
                             {comp.link && <a href={comp.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:underline truncate block max-w-[200px]">{comp.link}</a>}
                          </div>
                          <div className="flex items-center gap-3">
                             <span className="text-emerald-600 dark:text-emerald-400 font-mono">${Number(comp.soldPrice).toLocaleString()}</span>
                             <button 
                               type="button" 
                               onClick={() => handleRemoveComp(index)}
                               className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
                             >
                                <X size={14} />
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
               )}
            </div>

            {/* CRM Fields */}
            <div className="bg-white dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
               <div className="flex justify-between items-center">
                  <h4 className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">CRM Details</h4>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    >
                      <option value="New Lead">New Lead</option>
                      <option value="Analyzing">Analyzing</option>
                      <option value="Offer Made">Offer Made</option>
                      <option value="Under Contract">Under Contract</option>
                      <option value="Closed">Closed</option>
                      <option value="Dead">Dead</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Lead Source</label>
                    <select 
                      value={formData.leadSource}
                      onChange={(e) => setFormData({...formData, leadSource: e.target.value})}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    >
                      <option value="MLS">MLS</option>
                      <option value="Off-Market">Off-Market</option>
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Direct Mail">Direct Mail</option>
                      <option value="Referral">Referral</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <InputField label="Seller Name" value={formData.sellerName} onChange={v => setFormData({...formData, sellerName: v})} placeholder="John Doe" />
                  <InputField label="Seller Phone" value={formData.sellerPhone} onChange={v => setFormData({...formData, sellerPhone: v})} placeholder="555-0123" />
                  <InputField label="Seller Email" value={formData.sellerEmail} onChange={v => setFormData({...formData, sellerEmail: v})} placeholder="john@example.com" />
               </div>
            </div>

            <ImageUploader 
              imageUrls={formData.imageUrls} 
              onImageUrlsChange={urls => setFormData({...formData, imageUrls: urls})} 
              currentInput={tempImageUrl}
              onCurrentInputChange={setTempImageUrl}
              fallbackImage={generatedMapImageUrl}
            />
            <div>
              <label className="block text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Notes</label>
              <textarea 
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 text-sm"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Key selling points..."
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-2xl flex-shrink-0">
          <button 
            type="submit" 
            form="deal-form"
            className={`w-full font-bold py-3 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${isAgentMode ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-900/20'} text-white transition-all`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};


AddDealModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  onUpdate: PropTypes.func,
  onUpgrade: PropTypes.func,
};

export default AddDealModal;