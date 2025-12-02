import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Target, Save, MapPin, DollarSign, Percent } from 'lucide-react';
import InputField from './InputField';

const PROPERTY_TYPES = ['Single Family', 'Multi-Family', 'Condo', 'Land', 'Commercial'];

const BuyBoxModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [criteria, setCriteria] = useState({
    locations: '', // Comma separated
    minPrice: '',
    maxPrice: '',
    minRoi: '',
    minCapRate: '',
    propertyTypes: [],
    minBedrooms: '',
  });

  useEffect(() => {
    if (initialData) {
      setCriteria({
        locations: initialData.locations?.join(', ') || '',
        minPrice: initialData.minPrice || '',
        maxPrice: initialData.maxPrice || '',
        minRoi: initialData.minRoi || '',
        minCapRate: initialData.minCapRate || '',
        propertyTypes: initialData.propertyTypes || [],
        minBedrooms: initialData.minBedrooms || '',
      });
    }
  }, [initialData]);

  const togglePropertyType = (type) => {
    setCriteria(prev => {
      const types = prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type];
      return { ...prev, propertyTypes: types };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedData = {
      ...criteria,
      locations: criteria.locations.split(',').map(l => l.trim()).filter(l => l),
      minPrice: Number(criteria.minPrice) || 0,
      maxPrice: Number(criteria.maxPrice) || 0,
      minRoi: Number(criteria.minRoi) || 0,
      minCapRate: Number(criteria.minCapRate) || 0,
      minBedrooms: Number(criteria.minBedrooms) || 0,
    };
    onSave(formattedData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Target className="text-emerald-400" size={24} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-white">My Buy Box</h3>
                <p className="text-slate-400 text-xs">Define your perfect deal criteria</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <form id="buy-box-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Locations */}
            <div>
                <label className="block text-slate-400 text-xs uppercase tracking-wider mb-2 font-semibold">Target Locations</label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        value={criteria.locations}
                        onChange={(e) => setCriteria({...criteria, locations: e.target.value})}
                        placeholder="Austin, TX, 78704, Miami, FL"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                </div>
                <p className="text-slate-500 text-xs mt-1">Separate cities, zips, or neighborhoods with commas.</p>
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-2 gap-4">
                <InputField 
                    label="Min Price" 
                    type="number" 
                    value={criteria.minPrice} 
                    onChange={v => setCriteria({...criteria, minPrice: v})} 
                    prefix="$"
                    placeholder="0"
                />
                <InputField 
                    label="Max Price" 
                    type="number" 
                    value={criteria.maxPrice} 
                    onChange={v => setCriteria({...criteria, maxPrice: v})} 
                    prefix="$"
                    placeholder="500,000"
                />
            </div>

            {/* Financials */}
            <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50 space-y-4">
                <h4 className="text-slate-300 text-sm font-bold flex items-center gap-2">
                    <Percent size={16} className="text-emerald-400" /> Financial Targets
                </h4>
                <div className="grid grid-cols-2 gap-4">
                    <InputField 
                        label="Min ROI %" 
                        type="number" 
                        value={criteria.minRoi} 
                        onChange={v => setCriteria({...criteria, minRoi: v})} 
                        suffix="%"
                        placeholder="15"
                    />
                    <InputField 
                        label="Min Cap Rate %" 
                        type="number" 
                        value={criteria.minCapRate} 
                        onChange={v => setCriteria({...criteria, minCapRate: v})} 
                        suffix="%"
                        placeholder="8"
                    />
                </div>
            </div>

            {/* Property Types */}
            <div>
                <label className="block text-slate-400 text-xs uppercase tracking-wider mb-2 font-semibold">Property Types</label>
                <div className="flex flex-wrap gap-2">
                    {PROPERTY_TYPES.map(type => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => togglePropertyType(type)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                                criteria.propertyTypes.includes(type)
                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <InputField 
                label="Min Bedrooms" 
                type="number" 
                value={criteria.minBedrooms} 
                onChange={v => setCriteria({...criteria, minBedrooms: v})} 
                placeholder="3"
            />

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 rounded-b-2xl">
          <button 
            type="submit" 
            form="buy-box-form"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all"
          >
            <Save size={20} /> Save Criteria
          </button>
        </div>
      </div>
    </div>
  );
};

BuyBoxModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initialData: PropTypes.object,
};

export default BuyBoxModal;