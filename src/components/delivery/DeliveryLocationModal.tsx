import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { ADDIS_ABABA_LOCATIONS, AWARE_FARM_LOCATION } from '../../data/addisLocations';
import { SelectedDeliveryLocation } from '../../types/delivery';
import { api } from '../../services/api';
import {
  MapPin,
  Navigation,
  Search,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Route,
  Info,
  CheckCircle2,
  Building2,
  Crosshair
} from 'lucide-react';

interface DeliveryLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: SelectedDeliveryLocation) => void;
  selectedLocation?: SelectedDeliveryLocation | null;
  currentSelected?: SelectedDeliveryLocation | null;
}

interface PlaceSearchResult {
  name: string;
  address: string;
  subCity?: string;
  category?: string;
  lat: number;
  lng: number;
}

// Client-side Haversine Geodesic Road Distance Formula
function calculateHaversineRoadKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;
  return Math.max(0.8, Math.round(straightLine * 1.32 * 10) / 10);
}

export const DeliveryLocationModal: React.FC<DeliveryLocationModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  selectedLocation,
  currentSelected
}) => {
  const activeSelected = selectedLocation || currentSelected;
  const { isAmharic } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'design7';

  // Map DOM and Leaflet instance references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const farmMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Search & Geolocation states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Pin & Address states
  const [currentLat, setCurrentLat] = useState<number>(activeSelected?.lat || 8.9984);
  const [currentLng, setCurrentLng] = useState<number>(activeSelected?.lng || 38.7877);
  const [resolvedAddress, setResolvedAddress] = useState<string>(
    activeSelected?.address || 'Bole Medhanialem / Edna Mall, Addis Ababa'
  );
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Live GPS state
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [gpsSuccess, setGpsSuccess] = useState<string | null>(null);

  // Road Routing States (Exact Turn-by-Turn Driving Distance & Time)
  const [roadDistanceKm, setRoadDistanceKm] = useState<number>(() =>
    calculateHaversineRoadKm(
      AWARE_FARM_LOCATION.lat,
      AWARE_FARM_LOCATION.lng,
      activeSelected?.lat || 8.9984,
      activeSelected?.lng || 38.7877
    )
  );
  const [roadDurationMins, setRoadDurationMins] = useState<number>(15);
  const [isWithinRange, setIsWithinRange] = useState<boolean>(true);
  const [isRouting, setIsRouting] = useState<boolean>(false);

  // Persistent reference for active coordinates (prevents any loss during renders)
  const activeCoordsRef = useRef<{ lat: number; lng: number }>({
    lat: activeSelected?.lat || 8.9984,
    lng: activeSelected?.lng || 38.7877
  });

  // Track modal open/close transitions so we only initialize when opening
  const prevIsOpenRef = useRef<boolean>(false);

  // Perform reverse geocoding on coordinates
  const performReverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const res = await api.reverseGeocode(lat, lng);
      if (res.success && res.data?.address) {
        setResolvedAddress(res.data.address);
      } else {
        // Fallback to closest local landmark
        let closest = ADDIS_ABABA_LOCATIONS[0];
        let minD = Infinity;
        for (const loc of ADDIS_ABABA_LOCATIONS) {
          const dLat = loc.lat - lat;
          const dLng = loc.lng - lng;
          const dist = dLat * dLat + dLng * dLng;
          if (dist < minD) {
            minD = dist;
            closest = loc;
          }
        }
        setResolvedAddress(`${closest.name}, ${closest.subCity} Sub-City, Addis Ababa`);
      }
    } catch (e) {
      console.warn('Reverse geocoding error:', e);
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  // Fetch actual driving road route from OSRM engine and draw turn-by-turn road polyline
  const fetchRoadRoute = useCallback(async (destLat: number, destLng: number) => {
    // 1. Immediately set instant client-side road distance as responsive baseline
    const instantKm = calculateHaversineRoadKm(
      AWARE_FARM_LOCATION.lat,
      AWARE_FARM_LOCATION.lng,
      destLat,
      destLng
    );
    setRoadDistanceKm(instantKm);
    setRoadDurationMins(Math.max(8, Math.round((instantKm / 22) * 60) + 5));
    setIsWithinRange(instantKm <= 30);

    if (polylineRef.current) {
      polylineRef.current.setLatLngs([
        [AWARE_FARM_LOCATION.lat, AWARE_FARM_LOCATION.lng],
        [destLat, destLng]
      ]);
    }

    // 2. Fetch full turn-by-turn route geometry from backend OSRM
    setIsRouting(true);
    try {
      const res = await api.getDeliveryRoute(destLat, destLng);
      if (res.success && res.data) {
        setRoadDistanceKm(res.data.distanceKm);
        setRoadDurationMins(res.data.estimatedDurationMinutes);
        setIsWithinRange(res.data.isWithinRange);

        if (polylineRef.current) {
          if (res.data.routeCoordinates && res.data.routeCoordinates.length > 0) {
            polylineRef.current.setLatLngs(res.data.routeCoordinates);
          } else {
            polylineRef.current.setLatLngs([
              [AWARE_FARM_LOCATION.lat, AWARE_FARM_LOCATION.lng],
              [destLat, destLng]
            ]);
          }
        }
      }
    } catch (err) {
      console.warn('Error fetching driving road route:', err);
    } finally {
      setIsRouting(false);
    }
  }, []);

  // Central function to update pin, coordinates, route, and address
  const updatePinAndLocation = useCallback(
    (lat: number, lng: number, label?: string, shouldFly: boolean = false) => {
      activeCoordsRef.current = { lat, lng };
      setCurrentLat(lat);
      setCurrentLng(lng);

      if (label) {
        setResolvedAddress(label);
      } else {
        performReverseGeocode(lat, lng);
      }

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([lat, lng]);
      }

      if (shouldFly && mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 0.8 });
      }

      fetchRoadRoute(lat, lng);
    },
    [performReverseGeocode, fetchRoadRoute]
  );

  // Store updatePinAndLocation in a stable ref for Leaflet event callbacks
  const updatePinRef = useRef(updatePinAndLocation);
  useEffect(() => {
    updatePinRef.current = updatePinAndLocation;
  }, [updatePinAndLocation]);

  // Sync state ONLY when modal transitions from closed (false) to open (true)
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      const initLat = activeSelected?.lat || 8.9984;
      const initLng = activeSelected?.lng || 38.7877;
      const initAddr = activeSelected?.address || 'Bole Medhanialem / Edna Mall, Addis Ababa';

      activeCoordsRef.current = { lat: initLat, lng: initLng };
      setCurrentLat(initLat);
      setCurrentLng(initLng);
      setResolvedAddress(initAddr);
      setGeoError(null);
      setGpsSuccess(null);
      setSearchQuery('');
      setShowSearchResults(false);

      const initDist = calculateHaversineRoadKm(
        AWARE_FARM_LOCATION.lat,
        AWARE_FARM_LOCATION.lng,
        initLat,
        initLng
      );
      setRoadDistanceKm(initDist);
      setRoadDurationMins(Math.max(10, Math.round((initDist / 22) * 60) + 8));
      setIsWithinRange(initDist <= 30);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, activeSelected]);

  // Debounced Comprehensive Place & Hotel Search
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.searchPlaces(searchQuery);
        if (res.success && res.data && res.data.length > 0) {
          setSearchResults(res.data);
          setShowSearchResults(true);
        } else {
          // Local catalog comprehensive filter
          const local = ADDIS_ABABA_LOCATIONS.filter((l) => {
            const name = (l.name || '').toLowerCase();
            const amharic = (l.amharicName || '').toLowerCase();
            const subCity = (l.subCity || '').toLowerCase();
            const cat = (l.category || '').toLowerCase();
            return (
              name.includes(q) ||
              amharic.includes(q) ||
              subCity.includes(q) ||
              cat.includes(q) ||
              (q.includes('hotel') && cat === 'hotel') ||
              (q.includes('hospital') && cat === 'hospital') ||
              (q.includes('mall') && cat === 'mall')
            );
          })
            .slice(0, 8)
            .map((l) => ({
              name: l.name,
              address: `${l.name} (${l.subCity} Sub-City, Addis Ababa)`,
              subCity: l.subCity,
              category: l.category || 'landmark',
              lat: l.lat,
              lng: l.lng
            }));
          setSearchResults(local);
          setShowSearchResults(true);
        }
      } catch (err) {
        console.warn('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Initialize Leaflet Map (Run STRICTLY ONCE per modal open)
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // If map already exists and valid, just invalidate size and return
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
      return;
    }

    const initLat = activeCoordsRef.current.lat || 8.9984;
    const initLng = activeCoordsRef.current.lng || 38.7877;

    const map = L.map(mapContainerRef.current, {
      center: [initLat, initLng],
      zoom: 14,
      zoomControl: true,
      attributionControl: false
    });

    // Clean OpenStreetMap standard tile layer
    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c']
    }).addTo(map);

    // Custom Seller / Farm Main Facility HQ Icon
    const farmIcon = L.divIcon({
      className: 'custom-farm-pin',
      html: `
        <div style="background-color:#C18A45; width:36px; height:36px; border-radius:50%; border:3px solid #FFFFFF; box-shadow:0 4px 14px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; color:#FFFFFF; font-size:17px;">
          🌾
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    farmMarkerRef.current = L.marker([AWARE_FARM_LOCATION.lat, AWARE_FARM_LOCATION.lng], {
      icon: farmIcon,
      title: 'Jonny Livestock Main Facility (Seller Location)'
    }).addTo(map);

    farmMarkerRef.current.bindPopup(
      `<div style="font-family:sans-serif; font-size:12px; font-weight:bold; color:#2A1A0D; padding:4px;">
        🌾 Jonny Livestock Main Facility (Seller Location)<br/>
        <span style="font-size:10px; font-weight:normal; color:#666;">Arat Kilo / Belay Zeleke Street</span>
      </div>`
    );

    // High-Precision SVG Customer Pin Icon (Anchored exactly at the needle tip [18, 42])
    const userIcon = L.divIcon({
      className: 'custom-user-pin-marker',
      html: `
        <div style="position:relative; width:36px; height:42px; display:flex; flex-direction:column; align-items:center;">
          <svg width="36" height="42" viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 4px 10px rgba(225,29,72,0.45));">
            <path d="M18 0C8.05887 0 0 8.05887 0 18C0 28.5 18 42 18 42C18 42 36 28.5 36 18C36 8.05887 27.9411 0 18 0Z" fill="#E11D48"/>
            <circle cx="18" cy="16" r="8" fill="#FFFFFF"/>
            <circle cx="18" cy="16" r="4.5" fill="#E11D48"/>
          </svg>
          <div style="position:absolute; bottom:0; width:12px; height:4px; background:rgba(0,0,0,0.35); border-radius:50%; filter:blur(1px); transform:translateY(2px);"></div>
        </div>
      `,
      iconSize: [36, 42],
      iconAnchor: [18, 42],
      popupAnchor: [0, -40]
    });

    const userMarker = L.marker([initLat, initLng], {
      icon: userIcon,
      draggable: true,
      title: 'Your Delivery Destination (Drag to exact gate)'
    }).addTo(map);

    userMarkerRef.current = userMarker;

    // Turn-by-turn road polyline
    const polyline = L.polyline(
      [
        [AWARE_FARM_LOCATION.lat, AWARE_FARM_LOCATION.lng],
        [initLat, initLng]
      ],
      {
        color: '#10B981',
        weight: 5,
        opacity: 0.9,
        lineJoin: 'round',
        lineCap: 'round'
      }
    ).addTo(map);

    polylineRef.current = polyline;

    // Fetch initial road route
    fetchRoadRoute(initLat, initLng);

    // Marker Drag Listener: locks position and updates route
    userMarker.on('dragend', () => {
      const pos = userMarker.getLatLng();
      if (updatePinRef.current) {
        updatePinRef.current(pos.lat, pos.lng);
      }
    });

    // Map Click Listener: places pin directly at clicked coordinates
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      userMarker.setLatLng([lat, lng]);
      if (updatePinRef.current) {
        updatePinRef.current(lat, lng);
      }
    });

    mapInstanceRef.current = map;

    // Invalidate map size after DOM mount
    const t1 = setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 150);
    const t2 = setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 450);

    // Cleanup ONLY when modal completely closes
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      map.remove();
      mapInstanceRef.current = null;
      userMarkerRef.current = null;
      farmMarkerRef.current = null;
      polylineRef.current = null;
    };
  }, [isOpen]); // ONLY depends on isOpen! Never tears down during active interactions!

  // Recenter map on active pin
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([activeCoordsRef.current.lat, activeCoordsRef.current.lng], 15, {
        duration: 0.6
      });
    }
  };

  // Live GPS Geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError(
        isAmharic
          ? 'የአሰሳ ፕሮግራምዎ የጂፒኤስ መገኛን አይደግፍም'
          : 'Geolocation is not supported by your browser'
      );
      return;
    }

    setIsLocating(true);
    setGeoError(null);
    setGpsSuccess(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        updatePinAndLocation(latitude, longitude, undefined, true);
        setGpsSuccess(
          isAmharic
            ? `የጂፒኤስ መገኛዎ ተገኝቷል (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
            : `GPS location detected (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
        );
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError(
            isAmharic
              ? 'የመገኛ ቦታ ፈቃድ ተከልክሏል። እባክዎ በካርታው ላይ ይጫኑ ወይም ይፈልጉ።'
              : 'Location permission was denied. Please search or tap directly on the map.'
          );
        } else {
          setGeoError(
            isAmharic
              ? 'መገኛዎን በጂፒኤስ ማግኘት አልተቻለም። እባክዎ በካርታው ላይ ይምረጡ።'
              : 'Could not fetch GPS fix. Please click anywhere on the map.'
          );
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Confirm Location selection and pass to parent
  const handleConfirmLocation = () => {
    let finalAddress = resolvedAddress;
    if (customNotes.trim()) {
      finalAddress = `${resolvedAddress} (${customNotes.trim()})`;
    }

    onSelectLocation({
      address: finalAddress,
      lat: currentLat,
      lng: currentLng,
      isCustomPin: true
    });
    onClose();
  };

  // Render category icon helper
  const renderCategoryIcon = (category?: string) => {
    switch (category) {
      case 'hotel':
        return <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />;
      case 'hospital':
        return <span className="text-xs shrink-0 mt-0.5">🏥</span>;
      case 'mall':
        return <span className="text-xs shrink-0 mt-0.5">🛍️</span>;
      default:
        return <MapPin className="w-3.5 h-3.5 text-[#C18A45] shrink-0 mt-0.5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-4xl max-h-[95vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
          isDark
            ? 'bg-[#1D130A] border-[#4A2C16] text-[#F4E8D0]'
            : 'bg-white border-[#E4D4BC] text-[#2A1A0D]'
        }`}
      >
        {/* Header */}
        <div
          className="p-3.5 sm:p-4 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#C18A45]/15 text-[#C18A45] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-sm sm:text-base leading-tight">
                {isAmharic ? 'የማስረከቢያ ቦታዎን በካርታ ላይ ይምረጡ' : 'Select Delivery Location on Real Map'}
              </h2>
              <p className="text-[11px] opacity-75 mt-0.5">
                {isAmharic
                  ? 'ሆቴሎችን፣ ህንፃዎችን ይፈልጉ፣ ፒኑን ያንቀሳቅሱ ወይም የጂፒኤስ መገኛዎን ይጠቀሙ'
                  : 'Search any hotel, landmark, building, drag the pin to your gate, or use GPS'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Control Bar: Search Autocomplete + GPS Button */}
        <div
          className="p-3 sm:p-4 border-b space-y-2.5 shrink-0 bg-black/[0.02] dark:bg-white/[0.02]"
          style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}
        >
          <div className="flex flex-col sm:flex-row gap-2 relative">
            {/* Search Input with Category Autocomplete */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchResults(true);
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isAmharic
                    ? 'ሆቴል፣ ሆስፒታል፣ ሞል ወይም ሰፈር ይፈልጉ (ለምሳሌ፡ ስካይላይት፣ ሒልተን፣ ሼራተን፣ ቦሌ መድኃኒዓለም፣ አያት፣ ሲኤምሲ...)'
                    : 'Search any hotel, hospital, mall, or street (e.g. Skylight Hotel, Hilton, Sheraton, Edna Mall, Brass, Ayat...)'
                }
                className={`w-full pl-9 pr-8 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-[#C18A45] ${
                  isDark
                    ? 'bg-[#24170D] border-[#4A2C16] text-[#F4E8D0]'
                    : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                }`}
              />
              {isSearching ? (
                <RefreshCw className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 animate-spin opacity-60 text-[#C18A45]" />
              ) : searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 opacity-60 hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}

              {/* Autocomplete Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div
                  className={`absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border shadow-2xl max-h-64 overflow-y-auto ${
                    isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
                  }`}
                >
                  <div className="p-1.5 space-y-1">
                    {searchResults.map((place, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          updatePinAndLocation(place.lat, place.lng, place.address, true);
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                        className={`p-2.5 rounded-xl text-left cursor-pointer transition-colors flex items-start gap-2.5 ${
                          isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                        }`}
                      >
                        {renderCategoryIcon(place.category)}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 justify-between">
                            <span className="font-bold text-xs truncate">{place.name}</span>
                            {place.subCity && (
                              <span className="text-[9.5px] px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10 opacity-75 shrink-0">
                                {place.subCity}
                              </span>
                            )}
                          </div>
                          <div className="text-[10.5px] opacity-70 truncate mt-0.5">{place.address}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Live GPS Locate Button */}
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isLocating}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              {isLocating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{isAmharic ? 'በማግኘት ላይ...' : 'Detecting GPS...'}</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 animate-pulse" />
                  <span>{isAmharic ? 'የአሁኑ መገኛዬን ተጠቀም' : 'Use My Live GPS'}</span>
                </>
              )}
            </button>
          </div>

          {gpsSuccess && (
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{gpsSuccess}</span>
            </div>
          )}

          {geoError && (
            <div className="p-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{geoError}</span>
            </div>
          )}
        </div>

        {/* Map Container & Interactive Surface */}
        <div className="relative flex-1 min-h-[320px] sm:min-h-[380px] max-h-[480px] w-full bg-black/10">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

          {/* Floating Instructions */}
          <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2 pointer-events-none">
            <div className="px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-white text-[11px] font-medium shadow flex items-center gap-1.5 pointer-events-auto">
              <Info className="w-3.5 h-3.5 text-[#C18A45]" />
              <span>{isAmharic ? 'በካርታው ላይ ጠቅ ያድርጉ ወይም 📍 ፒኑን ይጎትቱ' : 'Click map or drag 📍 pin to exact gate'}</span>
            </div>
          </div>

          {/* Floating Route Distance Badge */}
          <div className="absolute top-3 right-3 z-10 pointer-events-none flex items-center gap-2">
            <button
              type="button"
              onClick={handleRecenter}
              title="Recenter on Pin"
              className="p-2 rounded-xl bg-black/85 backdrop-blur-md text-white shadow-lg border border-white/10 hover:bg-black pointer-events-auto cursor-pointer flex items-center justify-center"
            >
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
            </button>

            <div className="px-3.5 py-1.5 rounded-xl bg-black/85 backdrop-blur-md text-white text-xs font-mono font-bold shadow-lg flex items-center gap-2 border border-white/10 pointer-events-auto">
              <Route className="w-3.5 h-3.5 text-emerald-400" />
              {isRouting ? (
                <span className="flex items-center gap-1.5 text-[11px] font-sans text-amber-400">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>{isAmharic ? 'መንገድ በማስላት ላይ...' : 'Routing road...'}</span>
                </span>
              ) : (
                <>
                  <span className="text-emerald-400 font-bold">{roadDistanceKm} km</span>
                  <span className="text-[10px] opacity-80 font-sans font-normal">
                    (🚗 ~{roadDurationMins} {isAmharic ? 'ደቂቃ ጉዞ' : 'mins drive'})
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Selected Location Summary & Details Footer */}
        <div
          className="p-3.5 sm:p-4 border-t space-y-3 shrink-0 bg-black/[0.02] dark:bg-white/[0.02]"
          style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C18A45]">
                  {isAmharic ? 'የተመረጠው አድራሻ (Assigned Location):' : 'Assigned Delivery Address:'}
                </span>
                {isReverseGeocoding && (
                  <span className="text-[10px] text-amber-500 animate-pulse flex items-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    <span>Resolving address...</span>
                  </span>
                )}
              </div>
              <div className="font-bold text-xs sm:text-sm truncate mt-0.5">
                {resolvedAddress}
              </div>
              <div className="text-[11px] opacity-80 font-mono flex items-center gap-2 flex-wrap mt-0.5">
                <span>GPS: {currentLat.toFixed(5)}, {currentLng.toFixed(5)}</span>
                <span>•</span>
                <span className="text-emerald-500 font-bold font-sans">
                  🛣️ {roadDistanceKm} km {isAmharic ? 'የመኪና መንገድ' : 'driving road'} (~{roadDurationMins} {isAmharic ? 'ደቂቃ' : 'mins'})
                </span>
                {!isWithinRange && (
                  <span className="text-red-400 font-bold font-sans bg-red-500/15 px-2 py-0.5 rounded-md border border-red-500/20">
                    ⚠️ {isAmharic ? 'ከ30 ኪ.ሜ ማድረሻ ክልል ውጪ' : 'Beyond 30 km range'}
                  </span>
                )}
              </div>
            </div>

            {/* Optional Specific Note/House Number */}
            <div className="sm:w-64 shrink-0">
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder={isAmharic ? 'የቤት ቁጥር / የተለየ ምልክት (አማራጭ)...' : 'House #, gate color, or landmark (optional)...'}
                className={`w-full px-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#C18A45] ${
                  isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
                }`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}
            >
              {isAmharic ? 'ይቅር' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleConfirmLocation}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold text-xs shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isAmharic ? 'ይህንን ቦታ አረጋግጥ' : 'Confirm Delivery Location'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
