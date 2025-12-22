import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Search, Loader2, Calculator, FileText, UploadCloud, CheckCircle, Lock } from 'lucide-react';
import ImageUploader from './ImageUploader';
import InputField from './InputField';
import DealAnalysis from './DealAnalysis';
import { fetchPropertyData } from '../services/rencastService';
import { analyzeDeal } from '../services/geminiService';
import { decrementUserCredits } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { storage } from '../firebaseConfig';
import { ref, uploadBytes } from 'firebase/storage';

const REHAB_LEVELS = {
  LIGHT: { label: 'Light ($20/sqft)', cost: 20 },
  STANDARD: { label: 'Standard ($40/sqft)', cost: 40 },
  HEAVY: { label: 'Heavy ($70/sqft)', cost: 70 }
};

// Helper function to get Google Street View Static URL
const getGoogleStaticMapUrl = (lat, lng, address) => {
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!API_KEY) {
    console.warn("VITE_GOOGLE_MAPS_API_KEY is missing. Cannot generate map image.");
    return '';
  }

  const location = lat && lng ? `${lat},${lng}` : encodeURIComponent(address);
  if (!location) return '';

  // Construct the URL for Google Street View Static API
  // Using default heading/pitch for a general view.
  const url = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${location}&fov=90&heading=235&pitch=10&key=${API_KEY}`;
  return url;
};

const AddDealModal = ({ isOpen, onClose, onAdd, initialData, onUpdate, onUpgrade }) => {
  const { user } = useAuth();
  const { isPro, credits } = useSubscription();
  const [formData, setFormData] = useState({
    address: '', price: '', arv: '', rehab: '', rent: '', sqft: '', bedrooms: '', bathrooms: '', imageUrls: [], notes: '', aiAnalysis: null,
    sellerName: '', sellerPhone: '', sellerEmail: '', leadSource: 'Off-Market', status: 'New Lead',
    lat: null, lng: null,
    // Assignment Specific
    contractPrice: '', assignmentFee: '', emd: '', inspectionWindow: '', closingDate: '', proofOfContractPath: '', hasValidContract: false
  });
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [generatedMapImageUrl, setGeneratedMapImageUrl] = useState(''); // New state for map image
  const [analyzing, setAnalyzing] = useState(false);
  const [fetchingMarket, setFetchingMarket] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [rehabLevel, setRehabLevel] = useState(null); 
  
  // Assignment State
  const [isAssignment, setIsAssignment] = useState(false);
  const [contractFile, setContractFile] = useState(null);
  const [uploadingContract, setUploadingContract] = useState(false);

  // Marketplace Publish State
  const [postToMarketplace, setPostToMarketplace] = useState(false);

  // Comps State
  const [comps, setComps] = useState([]);
  const [newComp, setNewComp] = useState({ address: '', soldPrice: '', link: '' });

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
        contractPrice: initialData.contractPrice || '',
        assignmentFee: initialData.assignmentFee || '',
        emd: initialData.emd || '',
        inspectionWindow: initialData.inspectionWindow || '',
        closingDate: initialData.closingDate || '',
        proofOfContractPath: initialData.proofOfContractPath || '',
        hasValidContract: initialData.hasValidContract || false
      });
      setIsAssignment(initialData.hasValidContract || false);
      setComps(initialData.comps || []);
    } else {
      setFormData({
        address: '', price: '', arv: '', rehab: '', rent: '', sqft: '', bedrooms: '', bathrooms: '', imageUrls: [], notes: '', aiAnalysis: null,
        sellerName: '', sellerPhone: '', sellerEmail: '', leadSource: 'Off-Market', status: 'New Lead',
        lat: null, lng: null,
        contractPrice: '', assignmentFee: '', emd: '', inspectionWindow: '', closingDate: '', proofOfContractPath: '', hasValidContract: false
      });
      setIsAssignment(false);
      setComps([]);
    }
    setTempImageUrl('');
    setFetchError('');
    setRehabLevel(null);
    setContractFile(null);
    setUploadingContract(false);
    setPostToMarketplace(false);
    setNewComp({ address: '', soldPrice: '', link: '' });
  }, [initialData]);

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
    // Only generate if modal is open and address is available
    if (isOpen && (formData.address || (formData.lat && formData.lng))) {
      const url = getGoogleStaticMapUrl(formData.lat, formData.lng, formData.address);
      setGeneratedMapImageUrl(url);
    } else if (!isOpen) {
      setGeneratedMapImageUrl(''); // Clear when modal closes
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

    // Gating Logic
    if (!isPro) {
        if (credits <= 0) {
            setFetchError("You have 0 free credits left. Upgrade to Pro for unlimited access.");
            if (onUpgrade) setTimeout(onUpgrade, 1500); // Give user time to read error
            return;
        }
        // Decrement Credit
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

      // Apply RenCast Data
      if (rencastData.success) {
        updates.arv = rencastData.data.arv;
        updates.rent = rencastData.data.rentEstimate;
        updates.sqft = rencastData.data.sqft || formData.sqft;
        updates.bedrooms = rencastData.data.bedrooms || formData.bedrooms;
        updates.bathrooms = rencastData.data.bathrooms || formData.bathrooms;
        updates.lat = rencastData.data.latitude;
        updates.lng = rencastData.data.longitude;
        
        newAiAnalysis.market = rencastData.data;
        
        setFormData(prev => ({
          ...prev,
          ...updates,
          aiAnalysis: newAiAnalysis
        }));
      } else {
         setFetchError(rencastData.error || 'Market data fetch failed. Address might be invalid.');
      }

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
      } catch (err) {
          setFetchError('AI Analysis failed.');
      } finally {
          setAnalyzing(false);
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let finalFormData = { ...formData, comps }; // Include comps in final data
    finalFormData.hasValidContract = isAssignment;

    // Auto-add generated map image URL if available and no other images are present
    if (generatedMapImageUrl && finalFormData.imageUrls.length === 0) {
        finalFormData.imageUrls = [generatedMapImageUrl];
    }

    // Validate Assignment Requirements
    if (isAssignment) {
        if (!contractFile && !initialData?.proofOfContractPath) {
            alert("You must upload a proof of contract (PDF or Image) for assignment deals.");
            return;
        }
        
        if (contractFile && user) {
            try {
                setUploadingContract(true);
                // Secure Path: contracts/{userId}/{timestamp}_{filename}
                const storageRef = ref(storage, `contracts/${user.uid}/${Date.now()}_${contractFile.name}`);
                await uploadBytes(storageRef, contractFile);
                finalFormData.proofOfContractPath = storageRef.fullPath;
            } catch (error) {
                console.error("Contract upload failed", error);
                alert("Failed to upload contract. Please check your connection.");
                setUploadingContract(false);
                return;
            }
        }
    }

    // Auto-add any pending image URL in the input box
    if (tempImageUrl && !finalFormData.imageUrls.includes(tempImageUrl)) {
      finalFormData.imageUrls = [...finalFormData.imageUrls, tempImageUrl];
    }

    if (initialData) {
      onUpdate(initialData.id, finalFormData);
    } else {
      onAdd(finalFormData, postToMarketplace);
    }
    setTempImageUrl('');
    setUploadingContract(false);
    setNewComp({ address: '', soldPrice: '', link: '' });
    setComps([]);
    setPostToMarketplace(false);
    onClose();
  };

  const modalTitle = initialData ? "Edit Analysis" : "Analyze New Deal";
  const buttonText = uploadingContract ? "Uploading..." : (initialData ? "Update Analysis" : "Save Analysis");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
          <div>
             <h3 className="text-xl font-bold text-white">{modalTitle}</h3>
             <p className="text-slate-400 text-xs mt-1">Enter property details to generate a validation report.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1"><X size={20} /></button>
        </div>
        
        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
           
           {/* Toggle Deal Type */}
           <div className="flex p-1 bg-slate-800 rounded-xl mb-6">
             <button 
                type="button"
                onClick={() => setIsAssignment(false)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isAssignment ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
             >
                Standard Deal
             </button>
             <button 
                type="button"
                onClick={() => setIsAssignment(true)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isAssignment ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
             >
                Assignment Contract
             </button>
           </div>

           <div className="grid grid-cols-2 gap-3 mb-6 sticky top-0 z-10 bg-slate-900 pb-2">
                <button 
                    type="button" 
                    onClick={handleFetchMarketData}
                    disabled={fetchingMarket}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-700"
                >
                    {fetchingMarket ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                    {fetchingMarket ? 'Fetching...' : '1. Fetch Data'}
                </button>
                <button 
                    type="button" 
                    onClick={handleAnalyzeDeal}
                    disabled={analyzing || !formData.price || !formData.arv}
                    className={`font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border ${
                        analyzing || !formData.price || !formData.arv 
                        ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' 
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
            <InputField label="Address" value={formData.address} onChange={v => setFormData({...formData, address: v})} placeholder="123 Main St, City, State" />
            
            {/* Assignment Specific Fields */}
            {isAssignment && (
               <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2 text-indigo-400 mb-2">
                     <FileText size={18} />
                     <h4 className="text-sm font-bold uppercase tracking-wider">Assignment Details</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
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
                  
                  <div className="grid grid-cols-2 gap-4">
                     <InputField label="EMD Required" type="number" value={formData.emd} onChange={v => setFormData({...formData, emd: v})} prefix="$" />
                     <InputField label="Insp. Window (Days)" type="number" value={formData.inspectionWindow} onChange={v => setFormData({...formData, inspectionWindow: v})} />
                  </div>
                  
                  <InputField 
                    label="Closing Date" 
                    type="date" 
                    value={formData.closingDate} 
                    onChange={v => setFormData({...formData, closingDate: v})} 
                  />

                  {/* Contract Upload */}
                  <div>
                    <label className="block text-indigo-300 text-xs uppercase tracking-wider mb-2 font-semibold">
                        Proof of Contract {formData.proofOfContractPath && <span className="text-emerald-400">(Uploaded)</span>}
                    </label>
                    <div className="relative">
                        <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => setContractFile(e.target.files[0])}
                            className="hidden"
                            id="contract-upload"
                        />
                        <label 
                            htmlFor="contract-upload"
                            className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg border border-dashed border-indigo-500/50 hover:bg-indigo-900/30 cursor-pointer transition-colors ${contractFile ? 'bg-indigo-900/40 text-white' : 'text-indigo-300'}`}
                        >
                            {contractFile ? (
                                <>
                                   <CheckCircle size={18} className="text-emerald-400" />
                                   <span className="truncate">{contractFile.name}</span>
                                </>
                            ) : (
                                <>
                                   <UploadCloud size={18} />
                                   <span>Upload Contract (PDF/Image)</span>
                                </>
                            )}
                        </label>
                    </div>
                    <p className="text-[10px] text-indigo-400/60 mt-1 text-center">
                        *Stored securely. Only visible to you and admins.
                    </p>
                  </div>
               </div>
            )}

            <div className="grid grid-cols-2 gap-4">
               <InputField 
                 label={isAssignment ? "Total Price (Calc)" : "Price"} 
                 type="number" 
                 value={formData.price} 
                 onChange={v => setFormData({...formData, price: v})} 
                 prefix="$" 
                 disabled={isAssignment} // Disable manual edit if auto-calculated
               />
               <InputField label="Rehab Est." type="number" value={formData.rehab} onChange={v => setFormData({...formData, rehab: v})} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <InputField label="ARV" type="number" value={formData.arv} onChange={v => setFormData({...formData, arv: v})} prefix="$" />
               <InputField label="Est. Rent" type="number" value={formData.rent} onChange={v => setFormData({...formData, rent: v})} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Bedrooms" type="number" value={formData.bedrooms} onChange={v => setFormData({...formData, bedrooms: v})} />
              <InputField label="Bathrooms" type="number" value={formData.bathrooms} onChange={v => setFormData({...formData, bathrooms: v})} />
            </div>
            
             <div className="grid grid-cols-2 gap-4">
              <InputField label="Sqft" type="number" value={formData.sqft} onChange={v => setFormData({...formData, sqft: v})} suffix="sqft" />
              <div className="flex flex-col justify-end">
                  <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Rehab Level</label>
                  <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
                    {Object.keys(REHAB_LEVELS).map(level => (
                        <button
                            key={level}
                            type="button"
                            onClick={() => setRehabLevel(level)}
                            className={`flex-1 py-1 text-xs font-bold rounded ${rehabLevel === level ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                            title={REHAB_LEVELS[level].label}
                        >
                            {level[0]} {/* L, S, H */}
                        </button>
                    ))}
                  </div>
              </div>
            </div>

            {/* Comps Section */}
            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 space-y-3">
               <div className="flex justify-between items-center">
                  <h4 className="text-slate-400 text-xs uppercase font-bold">Market Comps (Optional)</h4>
               </div>
               
               {/* Add Comp Form */}
               <div className="grid grid-cols-1 md:grid-cols-7 gap-2 items-end">
                  <div className="md:col-span-3">
                     <InputField 
                        label="Comp Address" 
                        value={newComp.address} 
                        onChange={(v) => setNewComp({...newComp, address: v})} 
                        placeholder="123 Nearby St"
                     />
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
                      className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 rounded-lg text-sm transition-colors border border-slate-600"
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

               {/* Comps List */}
               {comps.length > 0 && (
                 <div className="space-y-2 mt-2">
                    {comps.map((comp, index) => (
                       <div key={index} className="flex justify-between items-center bg-slate-800 p-2 rounded border border-slate-700 text-xs">
                          <div className="flex-1 truncate pr-2">
                             <span className="text-white font-medium block">{comp.address}</span>
                             {comp.link && <a href={comp.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate block max-w-[200px]">{comp.link}</a>}
                          </div>
                          <div className="flex items-center gap-3">
                             <span className="text-emerald-400 font-mono">${Number(comp.soldPrice).toLocaleString()}</span>
                             <button 
                               type="button" 
                               onClick={() => handleRemoveComp(index)}
                               className="text-slate-500 hover:text-red-400"
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
            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 space-y-3">
               <div className="flex justify-between items-center">
                  <h4 className="text-slate-400 text-xs uppercase font-bold">CRM Details</h4>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
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
                    <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Lead Source</label>
                    <select 
                      value={formData.leadSource}
                      onChange={(e) => setFormData({...formData, leadSource: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
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
               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
              defaultImageUrl={generatedMapImageUrl} // Pass the generated map image URL
            />
            <div>
              <label className="block text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Notes</label>
              <textarea 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 text-sm"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Key selling points..."
              />
            </div>

            {/* Wholesaler Marketplace Option */}
            {user?.role === 'wholesaler' && !initialData && (
              <div className="bg-emerald-900/20 border border-emerald-500/30 p-3 rounded-xl flex items-start gap-3 mt-4">
                <input 
                  type="checkbox" 
                  id="postMarketplace" 
                  checked={postToMarketplace}
                  onChange={(e) => setPostToMarketplace(e.target.checked)}
                  className="mt-1 w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500 bg-slate-800 border-slate-600 cursor-pointer"
                />
                <div>
                  <label htmlFor="postMarketplace" className="text-white font-bold text-sm block cursor-pointer">
                    Post to Public Marketplace
                  </label>
                  <p className="text-slate-400 text-xs">
                    Make this deal visible to all investors on DealDrop. 
                    {isAssignment && <span className="text-emerald-400"> (Verified badge added with contract)</span>}
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-slate-800 bg-slate-900 rounded-b-2xl flex-shrink-0">
          <button 
            type="submit" 
            form="deal-form"
            disabled={uploadingContract}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploadingContract ? <Loader2 className="animate-spin" /> : buttonText}
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