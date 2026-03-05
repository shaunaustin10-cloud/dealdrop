import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import { Loader2, Layers, Lock } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../hooks/useSubscription';

const containerStyle = {
  width: '100%',
  height: '100%', // Fill the parent container (Split view)
  borderRadius: '1rem',
};

const defaultCenter = {
  lat: 39.8283,
  lng: -98.5795
};

// Offset helper for "Blind" listings to ensure pin/circle isn't exactly on the house
const getOffsetLocation = (lat, lng, seed) => {
    if (!lat || !lng) return { lat: 0, lng: 0 };
    // Consistent "random" offset based on deal ID string
    const numSeed = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const offsetLat = (Math.sin(numSeed) * 0.005); // ~500m
    const offsetLng = (Math.cos(numSeed) * 0.005);
    return {
        lat: parseFloat(lat) + offsetLat,
        lng: parseFloat(lng) + offsetLng
    };
};

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1e293b" }] }, // slate-800
  { elementType: "labels.text.stroke", stylers: [{ color: "#1e293b" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] }, // slate-400
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }], // slate-300
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#94a3b8" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#020617" }], // midnight
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#334155" }], // slate-700
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#94a3b8" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#475569" }], // slate-600
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1e293b" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f1f5f9" }], // slate-100
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#334155" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#94a3b8" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#020617" }], // midnight (Dark water)
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#020617" }],
  },
];

const lightMapStyle = []; // Default Google Maps Light Style

const libraries = ['places'];

// Helper to geocode address (Cloud Function -> Client Fallback)
const geocodeAddress = async (address) => {
  // 1. Try Cloud Function (Secure)
  try {
    const getGeocode = httpsCallable(functions, 'getGeocode');
    const result = await getGeocode({ address });
    
    // Handle structured response
    if (result.data) {
        if (result.data.lat && result.data.lng) {
            return result.data;
        }
        if (result.data.status === 'OVER_QUERY_LIMIT' || result.data.status === 'REQUEST_DENIED') {
            return { error: 'QUOTA_EXCEEDED', status: result.data.status };
        }
    }
  } catch (error) {
    console.warn("Cloud geocode failed, trying client-side fallback...", error);
  }

  // 2. Try Client-Side Geocoder (Fallback)
  if (window.google && window.google.maps) {
      try {
          const geocoder = new window.google.maps.Geocoder();
          const result = await new Promise((resolve, reject) => {
              geocoder.geocode({ address: address }, (results, status) => {
                  if (status === 'OK' && results[0]) {
                      resolve({
                          lat: results[0].geometry.location.lat(),
                          lng: results[0].geometry.location.lng()
                      });
                  } else {
                      resolve({ error: 'CLIENT_ERROR', status });
                  }
              });
          });
          return result;
      } catch (err) {
          console.error("Client geocode also failed:", err);
      }
  }
  
  return null;
};

const DealMap = ({ deals, onSelectDeal, hoveredDealId }) => {
  const { user } = useAuth();
  const { isVIP } = useSubscription();
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const { theme } = useTheme();
  const [map, setMap] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);
  const [geocodedDeals, setGeocodedDeals] = useState([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const sessionGeocache = useRef(new Map()); // address -> {lat, lng} or 'failed'
  const quotaExceededRef = useRef(false); // Persistent session-level quota block
  const [mapTypeId, setMapTypeId] = useState('roadmap');
  const mapRef = useRef(null);

  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    streetViewControl: true,
    mapTypeControl: false,
    fullscreenControl: false,
    styles: mapTypeId === 'roadmap' && theme === 'dark' ? darkMapStyle : lightMapStyle,
  };

  const toggleMapType = () => {
    setMapTypeId(prev => prev === 'roadmap' ? 'hybrid' : 'roadmap');
  };

  const onLoad = useCallback((map) => {
    mapRef.current = map;
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
    setMap(null);
  }, []);

  // Auto-Geocode deals missing coordinates on load
  useEffect(() => {
    const processDeals = async () => {
        // If we already hit a quota limit this session, don't even try
        if (quotaExceededRef.current) {
            console.warn("Geocoding suspended for this session due to quota limits.");
            return;
        }

        // Only run if there's actually something missing coordinates
        const needsGeocoding = deals.filter(d => (!d.lat || !d.lng) && !sessionGeocache.current.has(d.address));
        
        if (needsGeocoding.length > 0) {
            setIsGeocoding(true);
        }
        
        const processed = [];
        
        // Process SEQUENTIALLY to avoid burst rate limits and detect quota failure early
        for (const deal of deals) {
            let lat = deal.lat;
            let lng = deal.lng;

            if (!lat || !lng) {
                // Check Session Cache
                const cached = sessionGeocache.current.get(deal.address);
                if (cached && cached !== 'failed') {
                    lat = cached.lat;
                    lng = cached.lng;
                } else if (cached === 'failed' || quotaExceededRef.current) {
                    // Skip if failed or quota hit
                } else {
                    const result = await geocodeAddress(deal.address);
                    
                    if (result && result.lat && result.lng) {
                        lat = result.lat;
                        lng = result.lng;
                        sessionGeocache.current.set(deal.address, { lat, lng });
                    } else {
                        // Check for quota error
                        if (result && result.error === 'QUOTA_EXCEEDED' || result?.status === 'OVER_QUERY_LIMIT') {
                            console.error("CRITICAL: Geocoding Quota Exceeded. Suspending further requests.");
                            quotaExceededRef.current = true;
                        }
                        // Mark as failed so we don't keep hitting it
                        sessionGeocache.current.set(deal.address, 'failed');
                    }
                }
            }
            
            // Universal Gatekeeper Level
            const isFirstLook = (deal.dealScore || 0) >= 84;
            const isArchived = deal.status === 'Under Contract' || deal.status === 'Closed';
            const isOwner = user && (deal.sellerId === user.uid || deal.createdBy === user.uid);
            const isUnlockedByMe = deal.unlockedBy?.includes(user?.uid);
            
            const isBlind = !isOwner && (
                isArchived || 
                !user || 
                (isFirstLook ? (!isVIP && !user?.isVerified) : !isUnlockedByMe)
            );

            if (isBlind && lat && lng) {
                const offset = getOffsetLocation(lat, lng, deal.id);
                processed.push({ ...deal, lat: offset.lat, lng: offset.lng, isBlind: true });
            } else {
                processed.push({ ...deal, lat, lng, isBlind: false });
            }
        }
        
        setGeocodedDeals(processed);
        if (needsGeocoding.length > 0) {
            setIsGeocoding(false);
        }
    };

    if (deals.length > 0) {
        processDeals();
    }
  }, [deals, user, isVIP]);

  // Sync Map with List Hover (Pan & Zoom)
  useEffect(() => {
    if (hoveredDealId && geocodedDeals.length > 0 && map) {
      const deal = geocodedDeals.find(d => d.id === hoveredDealId);
      if (deal && deal.lat && deal.lng) {
        setActiveMarker(deal.id);
        
        // Pan to the deal
        const position = { lat: parseFloat(deal.lat), lng: parseFloat(deal.lng) };
        map.panTo(position);
        
        if (map.getZoom() < 12) {
            map.setZoom(14);
        }
      }
    } else {
        setActiveMarker(null);
    }
  }, [hoveredDealId, geocodedDeals, map]);

  // Auto-fit bounds on load (Only after geocoding is done)
  useEffect(() => {
    if (map && geocodedDeals.length > 0 && !isGeocoding) {
      const bounds = new window.google.maps.LatLngBounds();
      let validCount = 0;
      
      geocodedDeals.forEach(deal => {
        if (deal.lat && deal.lng) {
          bounds.extend({ lat: parseFloat(deal.lat), lng: parseFloat(deal.lng) });
          validCount++;
        }
      });

      if (validCount > 0) {
        map.fitBounds(bounds);
        
        // Prevent zooming in too close if only 1 deal
        if (validCount === 1) {
             const listener = window.google.maps.event.addListener(map, "idle", () => { 
                if (map.getZoom() > 15) map.setZoom(14); 
                window.google.maps.event.removeListener(listener); 
            });
        }
      }
    }
  }, [map, geocodedDeals, isGeocoding]);

  if (!isLoaded) {
    return (
      <div className="h-full w-full bg-white flex items-center justify-center rounded-2xl border border-slate-200">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {/* Map Type Toggle */}
      <div className="absolute top-4 right-12 z-10">
          <button 
            onClick={toggleMapType}
            className="bg-white dark:bg-slate-800 p-2.5 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2 font-bold text-xs"
            title="Toggle Satellite View"
          >
            <Layers size={18} className={mapTypeId === 'hybrid' ? 'text-emerald-500' : 'text-slate-400'} />
            <span className="hidden sm:inline">{mapTypeId === 'hybrid' ? 'Satellite' : 'Map'}</span>
          </button>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={4}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
        mapTypeId={mapTypeId}
      >
        {geocodedDeals.map((deal) => {
              if (!deal.lat || !deal.lng) return null;
              
              const isHovered = deal.id === hoveredDealId || deal.id === activeMarker;
              const position = { lat: parseFloat(deal.lat), lng: parseFloat(deal.lng) };

              if (deal.isBlind) {
                  return (
                      <React.Fragment key={deal.id}>
                          <Circle
                            center={position}
                            radius={1609} // 1 mile in meters
                            options={{
                                fillColor: theme === 'dark' ? '#FF6725' : '#FF6725',
                                fillOpacity: 0.15,
                                strokeColor: '#FF6725',
                                strokeOpacity: 0.5,
                                strokeWeight: 1,
                                clickable: true,
                            }}
                            onClick={() => onSelectDeal(deal)}
                          />
                          {/* Small Lock Icon in Center of Circle */}
                          <Marker 
                            position={position}
                            onClick={() => onSelectDeal(deal)}
                            icon={{
                                path: "M 0 0 m -10 0 a 10 10 0 1 0 20 0 a 10 10 0 1 0 -20 0",
                                fillColor: "#FF6725",
                                fillOpacity: 0.8,
                                scale: 0.5,
                                strokeColor: "white",
                                strokeWeight: 1
                            }}
                          />
                      </React.Fragment>
                  );
              }

              // Custom SVG Path for a "Price Pill" (Rounded Rectangle with tail)
              const pillPath = "M -20 -10 L 20 -10 C 23 -10 25 -8 25 -5 L 25 5 C 25 8 23 10 20 10 L 5 10 L 0 15 L -5 10 L -20 10 C -23 10 -25 8 -25 5 L -25 -5 C -25 -8 -23 -10 -20 -10 Z";

              return (
                <Marker
                  key={deal.id}
                  position={position}
                  onClick={() => onSelectDeal(deal)}
                  label={{
                    text: `$${(deal.price / 1000).toFixed(0)}k`,
                    color: "white", 
                    fontSize: "11px",
                    fontWeight: "bold",
                    className: "map-price-label",
                    labelOrigin: new window.google.maps.Point(0, 0)
                  }}
                  icon={{
                      path: pillPath,
                      fillColor: isHovered ? "#ef4444" : "#10b981", // Red on hover, Emerald default
                      fillOpacity: 1,
                      strokeColor: "white",
                      strokeWeight: 1.5,
                      scale: isHovered ? 1.4 : 1.2, // Slightly larger on hover
                      labelOrigin: new window.google.maps.Point(0, 0)
                  }}
                  zIndex={isHovered ? 100 : 1}
                />
              );
            })
          }
      </GoogleMap>
    </div>
  );
};

DealMap.propTypes = {
  deals: PropTypes.array.isRequired,
  onSelectDeal: PropTypes.func.isRequired,
  hoveredDealId: PropTypes.string,
};

export default DealMap;