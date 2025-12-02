import React from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon missing in Leaflet/React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const DealMap = ({ deals, onSelectDeal }) => {
  // Default center (US center approx)
  const position = [39.8283, -98.5795];

  // Helper to generate a deterministic "fake" coordinate from an address string
  // strictly for demo purposes until real geocoding is added.
  // Real app should store { lat: x, lng: y } in Firestore.
  const getCoordinates = (deal) => {
    if (deal.lat && deal.lng) return [deal.lat, deal.lng];
    
    // Fallback: Generate random spread around US center based on address hash
    // so they don't all stack on top of each other
    let hash = 0;
    for (let i = 0; i < deal.address.length; i++) {
      hash = deal.address.charCodeAt(i) + ((hash << 5) - hash);
    }
    const latOffset = (hash % 1000) / 100; // +/- 10 deg
    const lngOffset = ((hash >> 2) % 2000) / 100; // +/- 20 deg
    
    return [39.82 + latOffset, -98.57 + lngOffset];
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden h-[600px] relative z-0">
      <MapContainer center={position} zoom={4} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {deals.map((deal) => (
          <Marker key={deal.id} position={getCoordinates(deal)}>
            <Popup>
              <div className="min-w-[200px]">
                <div className="h-24 w-full mb-2 rounded overflow-hidden">
                    <img 
                      src={(deal.imageUrls && deal.imageUrls[0]) || `https://picsum.photos/seed/${deal.id}/200/100`} 
                      alt={deal.address} 
                      className="w-full h-full object-cover"
                    />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{deal.address}</h3>
                <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-emerald-600">${deal.price?.toLocaleString()}</span>
                    <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                        Score: {deal.dealScore}
                    </span>
                </div>
                <button 
                  onClick={() => onSelectDeal(deal)}
                  className="mt-2 w-full bg-slate-900 text-white text-xs py-1.5 rounded hover:bg-slate-700 transition-colors"
                >
                    View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

DealMap.propTypes = {
  deals: PropTypes.array.isRequired,
  onSelectDeal: PropTypes.func.isRequired,
};

export default DealMap;
