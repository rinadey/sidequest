import React, { useEffect, useRef, useState } from 'react';
import { JEDDAH_LOCATIONS } from '../../data/jeddahPlaces';
import { JeddahLocation, UserProfile } from '../../types';
import { 
  Compass, MapPin, CheckCircle2, Navigation, Layers, Search, 
  Sparkles, Coffee, Landmark, Palette, Waves, X, ExternalLink, Filter
} from 'lucide-react';

interface AdventureMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onStartQuestAtLocation?: (location: JeddahLocation) => void;
}

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Quests', icon: '🧭' },
  { id: 'heritage', label: 'Culture & Heritage', icon: '🏛️' },
  { id: 'cafe', label: 'Coffee & Cafes', icon: '☕' },
  { id: 'art', label: 'Art & Design', icon: '🎨' },
  { id: 'coastal', label: 'Coastal & Red Sea', icon: '🌊' },
  { id: 'leisure', label: 'Leisure & Parks', icon: '🎢' },
];

// Dark Adventure Map Style for Google Maps
const ADVENTURE_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#f59e0b' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#38bdf8' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#142938' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0f172a' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#334155' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#09233f' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#38bdf8' }] },
];

export const AdventureMapModal: React.FC<AdventureMapModalProps> = ({
  isOpen,
  onClose,
  user,
  onStartQuestAtLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlace, setSelectedPlace] = useState<JeddahLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGoogleMapLoaded, setIsGoogleMapLoaded] = useState<boolean>(false);
  const googleMapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Filter places
  const filteredPlaces = JEDDAH_LOCATIONS.filter((place) => {
    const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
    const matchesSearch =
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.nameArabic.includes(searchQuery) ||
      place.area.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isLocationVerifiedByUser = (placeId: string) => {
    return user.verifiedDiscoveries.some((d) => d.placeId === placeId);
  };

  // Load Google Maps script once
  useEffect(() => {
    if (!isOpen) return;

    const apiKey = 'AIzaSyDp9yNAp4aDc7f00qQUEw_WQ3_UtFsp2xk';
    const scriptId = 'google-maps-script-jeddah';

    if ((window as any).google && (window as any).google.maps) {
      setIsGoogleMapLoaded(true);
      return;
    }

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsGoogleMapLoaded(true);
      };
      script.onerror = () => {
        console.warn('Google Maps script failed to load, using interactive vector map.');
        setIsGoogleMapLoaded(false);
      };
      document.head.appendChild(script);
    } else {
      setIsGoogleMapLoaded(Boolean((window as any).google?.maps));
    }
  }, [isOpen]);

  // Initialize or update Google Map
  useEffect(() => {
    if (!isOpen || !isGoogleMapLoaded || !mapContainerRef.current) return;
    const google = (window as any).google;
    if (!google?.maps) return;

    if (!googleMapInstanceRef.current) {
      // Jeddah center
      const center = { lat: 21.5433, lng: 39.1728 };
      const map = new google.maps.Map(mapContainerRef.current, {
        center,
        zoom: 11,
        styles: ADVENTURE_MAP_STYLES,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      googleMapInstanceRef.current = map;
    }

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Add markers for filtered places
    filteredPlaces.forEach((place) => {
      const isVerified = isLocationVerifiedByUser(place.id);
      const markerColor = isVerified ? '#10b981' : '#f59e0b';

      const marker = new google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map: googleMapInstanceRef.current,
        title: place.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isVerified ? 9 : 8,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      marker.addListener('click', () => {
        setSelectedPlace(place);
        googleMapInstanceRef.current.panTo({ lat: place.lat, lng: place.lng });
      });

      markersRef.current.push(marker);
    });
  }, [isOpen, isGoogleMapLoaded, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-lg">
              🗺️
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase">
                Jeddah Adventure Map
              </div>
              <h2 className="text-base font-extrabold text-white">
                Discover Real Jeddah Side Quests
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-slate-300">
                {user.verifiedDiscoveries.length} Verified
              </span>
              <span className="text-slate-500">/</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-slate-300">
                {JEDDAH_LOCATIONS.length - user.verifiedDiscoveries.length} Available
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-1">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search places or areas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Map Workspace */}
        <div className="relative flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Main Map Viewport */}
          <div className="relative flex-1 bg-[#091829] overflow-hidden">
            {/* Google Map Div */}
            <div ref={mapContainerRef} className="w-full h-full min-h-[300px]" />

            {/* Fallback interactive visual pins if Google Maps script takes time */}
            {!isGoogleMapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center p-6 bg-slate-900/90 text-center">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto" />
                  <div className="text-sm font-bold text-slate-200">Loading Real Jeddah Map...</div>
                  <div className="text-xs text-slate-400">Connecting Google Maps Platform services</div>
                </div>
              </div>
            )}

            {/* Selected Place Overlay Card on Desktop */}
            {selectedPlace && (
              <div className="hidden sm:block absolute bottom-5 left-5 right-5 sm:right-auto sm:max-w-md z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-5 rounded-2xl shadow-2xl space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        {selectedPlace.area}
                      </span>
                      {isLocationVerifiedByUser(selectedPlace.id) ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          Unexplored
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">{selectedPlace.name}</h3>
                    <div className="text-xs font-tajawal text-slate-400">{selectedPlace.nameArabic}</div>
                  </div>
                  <button
                    onClick={() => setSelectedPlace(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{selectedPlace.description}</p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        selectedPlace.name + ' Jeddah'
                      )}`;
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Navigate</span>
                  </button>

                  {onStartQuestAtLocation && (
                    <button
                      onClick={() => onStartQuestAtLocation(selectedPlace)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-bold shadow-md transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Start Quest Here</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Place List Drawer (Right Side) */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900/95 overflow-y-auto p-4 space-y-2.5 max-h-60 md:max-h-none">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Locations ({filteredPlaces.length})
            </div>

            {filteredPlaces.map((place) => {
              const isVerified = isLocationVerifiedByUser(place.id);
              const isSelected = selectedPlace?.id === place.id;
              return (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => {
                    setSelectedPlace(place);
                    if (googleMapInstanceRef.current) {
                      googleMapInstanceRef.current.panTo({ lat: place.lat, lng: place.lng });
                      googleMapInstanceRef.current.setZoom(14);
                    }
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-400/80 shadow-md'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs mt-0.5 flex-shrink-0 ${
                      isVerified
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {isVerified ? '✓' : '📍'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-xs truncate">{place.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{place.area}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
