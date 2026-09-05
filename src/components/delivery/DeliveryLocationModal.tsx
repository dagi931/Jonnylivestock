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
  Crosshair,
  Building2,
  CheckCircle2,
  Sparkles
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

// Popular quick selection shortcuts across Addis Ababa
const QUICK_PRESET_AREAS = [
  { name: 'Arat Kilo', amharic: 'አራት ኪሎ', lat: 9.0335, lng: 38.7635, address: 'Arat Kilo / Unity Park, Addis Ababa' },
  { name: 'Kazanchis', amharic: 'ካዛንቺስ', lat: 9.0175, lng: 38.7690, address: 'Kazanchis / UNECA Area, Kirkos, Addis Ababa' },
  { name: 'Bole Medhanialem', amharic: 'ቦሌ መድኃኒዓለም', lat: 8.9984, lng: 38.7877, address: 'Bole Medhanialem / Edna Mall, Bole, Addis Ababa' },
  { name: 'Megenagna', amharic: 'መገናኛ', lat: 9.0205, lng: 38.8020, address: 'Megenagna / Zefmesh Grand Mall, Yeka, Addis Ababa' },
  { name: 'CMC', amharic: 'ሲኤምሲ', lat: 9.0210, lng: 38.8280, address: 'CMC St. Michael / Tsehay Real Estate, Yeka, Addis Ababa' },
  { name: 'Sarbet', amharic: 'ሳርቤት', lat: 8.9950, lng: 38.7350, address: 'Sarbet / AU Headquarters Area, Kirkos, Addis Ababa' },
  { name: 'Piassa', amharic: 'ፒያሳ', lat: 9.0340, lng: 38.7520, address: 'Piassa / Churchill Avenue, Arada, Addis Ababa' },
  { name: 'Ayat', amharic: 'አያት', lat: 9.0270, lng: 38.8650, address: 'Ayat Real Estate / Roundabout, Bole, Addis Ababa' },
  { name: 'Lebu', amharic: 'ለቡ', lat: 8.9550, lng: 38.7230, address: 'Lebu / Mebrat Hayl, Nifas Silk, Addis Ababa' },
  { name: 'Jemo', amharic: 'ጀሞ', lat: 8.9420, lng: 38.7050, address: 'Jemo 1 & 2 Condominiums, Nifas Silk, Addis Ababa' },
  { name: 'Gerji', amharic: 'ገርጂ', lat: 8.9920, lng: 38.8100, address: 'Gerji / Roba Bakery / Imperial, Bole, Addis Ababa' },
  { name: '22 Mazoria', amharic: '22 ማዞሪያ', lat: 9.0150, lng: 38.7850, address: '22 Mazoria / Gollagul Tower, Yeka, Addis Ababa' }
];

// Client-side Haversine Road Distance Formula (Fast baseline, never 0 or null)
function calculateHaversineRoadKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
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

  // Map DOM & Leaflet instance refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const farmMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Active Pin & Address state
  const [currentLat, setCurrentLat] = useState<number>(activeSelected?.lat || 9.0175);
  const [currentLng, setCurrentLng] = useState<number>(activeSelected?.lng || 38.7690);
  const [resolvedAddress, setResolvedAddress] = useState<string>(
    activeSelected?.address || 'Kazanchis / UNECA Area, Kirkos, Addis Ababa'
  );
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Live GPS state
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [gpsSuccess, setGpsSuccess] = useState<string | null>(null);

  // Road Routing state
  const [roadDistanceKm, setRoadDistanceKm] = useState<number>(() =>
    calculateHaversineRoadKm(
      AWARE_FARM_LOCATION.lat,
      AWARE_FARM_LOCATION.lng,
      activeSelected?.lat || 9.0175,
      activeSelected?.lng || 38.7690
    )
  );
  const [roadDurationMins, setRoadDurationMins] = useState<number>(15);
  const [isWithinRange, setIsWithinRange] = useState<boolean>(true);
  const [isRouting, setIsRouting] = useState<boolean>(false);

  // Persistent reference for active coordinates (safeguard against re-render race conditions)
  const activeCoordsRef = useRef<{ lat: number; lng: number }>({
    lat: activeSelected?.lat || 9.0175,
    lng: activeSelected?.lng || 38.7690
  });

  // Track modal open/close transitions
  const prevIsOpenRef = useRef<boolean>(false);

  // Reverse geocoding helper
  const performReverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const res = await api.reverseGeocode(lat, lng);
      if (res.success && res.data?.address) {
        setResolvedAddress(res.data.address);
      } else {
        // Fallback to nearest landmark
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

  // Fetch driving route and draw road polyline
  const fetchRoadRoute = useCallback(async (destLat: number, destLng: number) => {
    // 1. Instant client-side fallback calculation (guarantees distance is never lost or blank)
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

    // 2. Fetch OSRM turn-by-turn road geometry from backend
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
      console.warn('Error fetching road route:', err);
    } finally {
      setIsRouting(false);
    }
  }, []);

  // Central pin & location updater
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

  // Stable ref for Leaflet event handlers
  const updatePinRef = useRef(updatePinAndLocation);
  useEffect(() => {
    updatePinRef.current = updatePinAndLocation;
  }, [updatePinAndLocation]);

  // Sync state strictly when modal transitions from closed to open
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      const initLat = activeSelected?.lat || 9.0175;
      const initLng = activeSelected?.lng || 38.7690;
      const initAddr = activeSelected?.address || 'Kazanchis / UNECA Area, Kirkos, Addis Ababa';

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

  // Search query filter (combines backend search with instant local catalog fallback)
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
          // Instant local search filter
          const local = ADDIS_ABABA_LOCATIONS.filter((l) => {
            const name = (l.name || '').toLowerCase();
            const amharic = (l.amharicName || '').toLowerCase();
            const subCity = (l.subCity || '').toLowerCase();
            return name.includes(q) || amharic.includes(q) || subCity.includes(q);
          })
            .slice(0, 7)
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
        console.warn('Place search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Leaflet Map Initialization (strictly once per modal open session)
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
      return;
    }

    const initLat = activeCoordsRef.current.lat || 9.0175;
    const initLng = activeCoordsRef.current.lng || 38.7690;

    const map = L.map(mapContainerRef.current, {
      center: [initLat, initLng],
      zoom: 14,
      zoomControl: true,
      attributionControl: false
    });

    // OpenStreetMap standard tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c']
    }).addTo(map);

    // Seller HQ Marker (Arat Kilo / Belay Zeleke St: 9.0314, 38.7725)
    const farmIcon = L.divIcon({
      className: 'custom-farm-pin',
      html: `
        <div style="background-color:#C18A45; width:34px; height:34px; border-radius:50%; border:3px solid #FFFFFF; box-shadow:0 3px 12px rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; color:#FFFFFF; font-size:16px;">
          🌾
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    farmMarkerRef.current = L.marker([AWARE_FARM_LOCATION.lat, AWARE_FARM_LOCATION.lng], {
      icon: farmIcon,
      title: 'Jonny Livestock Main Facility (Seller HQ: Arat Kilo)'
    }).addTo(map);

    farmMarkerRef.current.bindPopup(
      `<div style="font-family:sans-serif; font-size:12px; font-weight:bold; color:#2A1A0D; padding:4px;">
        🌾 Jonny Livestock Main Facility (Seller HQ)<br/>
        <span style="font-size:10px; font-weight:normal; color:#666;">Arat Kilo / Belay Zeleke Street</span>
      </div>`
    );

    // Customer Delivery Destination Pin (Draggable SVG needle anchored at tip [18, 42])
    const userIcon = L.divIcon({
      className: 'custom-user-pin-marker',
      html: `
        <div style="position:relative; width:36px; height:42px; display:flex; flex-direction:column; align-items:center;">
          <svg width="36" height="42" viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 4px 10px rgba(225,29,72,0.5));">
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

    // Fetch initial route
    fetchRoadRoute(initLat, initLng);

    // Marker Drag listener
    userMarker.on('dragend', () => {
      const pos = userMarker.getLatLng();
      if (updatePinRef.current) {
        updatePinRef.current(pos.lat, pos.lng);
      }
    });

    // Map Click listener
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      userMarker.setLatLng([lat, lng]);
      if (updatePinRef.current) {
        updatePinRef.current(lat, lng);
      }
    });

    mapInstanceRef.current = map;

    const t1 = setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 120);
    const t2 = setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      map.remove();
      mapInstanceRef.current = null;
      userMarkerRef.current = null;
      farmMarkerRef.current = null;
      polylineRef.current = null;
    };
  }, [isOpen]);

  // Recenter button
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([activeCoordsRef.current.lat, activeCoordsRef.current.lng], 15, {
        duration: 0.6
      });
    }
  };

  // Live GPS geolocation
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
            : `GPS detected (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
        );
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError(
            isAmharic
              ? 'የመገኛ ቦታ ፈቃድ ተከልክሏል። እባክዎ በካርታው ላይ ይጫኑ ወይም ይፈልጉ።'
              : 'Location permission denied. Please search or tap on map.'
          );
        } else {
          setGeoError(
            isAmharic
              ? 'መገኛዎን በጂፒኤስ ማግኘት አልተቻለም። እባክዎ በካርታው ላይ ይምረጡ።'
              : 'Could not fetch GPS fix. Please tap anywhere on the map.'
          );
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Confirm and return location to parent
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div
        className={`relative w-full max-w-2xl max-h-[88vh] rounded-2xl sm:rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
          isDark
            ? 'bg-[#1A1108] border-[#4A2C16] text-[#F4E8D0]'
            : 'bg-white border-[#E4D4BC] text-[#2A1A0D]'
        }`}
      >
        {/* Compact Header */}
        <div
          className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#C18A45]/15 text-[#C18A45] flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xs sm:text-sm leading-tight">
                {isAmharic ? 'የማስረከቢያ ቦታ በካርታ ይምረጡ' : 'Select Delivery Location on Map'}
              </h2>
              <p className="text-[10.5px] opacity-70">
                {isAmharic
                  ? 'ሻጭ፡ አራት ኪሎ (ቤላይ ዘለቀ መንገድ) • ፒኑን ወደ ቤትዎ በር ያንቀሳቅሱ'
                  : 'Origin: Arat Kilo (Belay Zeleke St) • Drag 📍 pin to exact gate'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compact Search Bar & GPS */}
        <div
          className="p-2.5 sm:p-3 border-b space-y-2 shrink-0 bg-black/[0.02] dark:bg-white/[0.02]"
          style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}
        >
          <div className="flex gap-2 relative">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchResults(true);
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isAmharic
                    ? 'ሆቴል፣ ህንፃ፣ ሞል ወይም ሰፈር ይፈልጉ (ቦሌ፣ ሲኤምሲ፣ ካዛንቺስ፣ አያት...)'
                    : 'Search hotel, landmark, building, street (e.g. Skylight, Hilton, Edna Mall, CMC, Ayat...)'
                }
                className={`w-full pl-8 pr-7 py-1.5 sm:py-2 rounded-xl border text-xs focus:outline-none focus:ring-1.5 focus:ring-[#C18A45] ${
                  isDark
                    ? 'bg-[#24170D] border-[#4A2C16] text-[#F4E8D0]'
                    : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                }`}
              />
              {isSearching ? (
                <RefreshCw className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-[#C18A45]" />
              ) : searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : null}

              {/* Autocomplete Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div
                  className={`absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border shadow-xl max-h-48 overflow-y-auto ${
                    isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
                  }`}
                >
                  <div className="p-1 space-y-0.5">
                    {searchResults.map((place, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          updatePinAndLocation(place.lat, place.lng, place.address, true);
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                        className={`p-2 rounded-lg text-left cursor-pointer transition-colors flex items-start gap-2 ${
                          isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs truncate">{place.name}</span>
                            {place.subCity && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 opacity-70 shrink-0">
                                {place.subCity}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] opacity-70 truncate">{place.address}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* GPS Locate Button */}
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isLocating}
              className="px-3 py-1.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
              title="Use GPS Coordinates"
            >
              {isLocating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{isAmharic ? 'የእኔ ጂፒኤስ' : 'Live GPS'}</span>
            </button>
          </div>

          {/* Quick-Select Area Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-[11px]">
            <span className="text-[10px] font-bold opacity-60 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
              {isAmharic ? 'ፈጣን ምርጫ:' : 'Quick Area:'}
            </span>
            {QUICK_PRESET_AREAS.map((area, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => updatePinAndLocation(area.lat, area.lng, area.address, true)}
                className={`px-2 py-0.5 rounded-lg border text-[10.5px] whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  Math.abs(currentLat - area.lat) < 0.005 && Math.abs(currentLng - area.lng) < 0.005
                    ? 'bg-[#C18A45] text-white border-[#C18A45] font-bold shadow-xs'
                    : isDark
                    ? 'bg-[#24170D] border-[#4A2C16] text-[#D8C5A8] hover:border-[#C18A45]/60'
                    : 'bg-white border-[#E4D4BC] text-[#746556] hover:border-[#C18A45]'
                }`}
              >
                {isAmharic ? area.amharic : area.name}
              </button>
            ))}
          </div>

          {gpsSuccess && (
            <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{gpsSuccess}</span>
            </div>
          )}

          {geoError && (
            <div className="p-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-[11px] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{geoError}</span>
            </div>
          )}
        </div>

        {/* Minimized Map Surface (Compact Height: 210px - 240px) */}
        <div className="relative w-full h-[210px] sm:h-[240px] bg-black/10 shrink-0">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

          {/* Floating Instructions Banner */}
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <div className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white text-[10px] font-medium shadow flex items-center gap-1.5 pointer-events-auto">
              <MapPin className="w-3 h-3 text-[#C18A45]" />
              <span>{isAmharic ? 'በካርታው ላይ ጠቅ ያድርጉ ወይም 📍 ፒኑን ይጎትቱ' : 'Click map or drag 📍 pin to your gate'}</span>
            </div>
          </div>

          {/* Floating Route Badge & Recenter Button */}
          <div className="absolute top-2 right-2 z-10 pointer-events-none flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleRecenter}
              title="Recenter on Pin"
              className="p-1.5 rounded-lg bg-black/85 backdrop-blur-md text-white shadow border border-white/10 hover:bg-black pointer-events-auto cursor-pointer"
            >
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
            </button>

            <div className="px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md text-white text-[11px] font-mono font-bold shadow flex items-center gap-1.5 border border-white/10 pointer-events-auto">
              <Route className="w-3 h-3 text-emerald-400" />
              {isRouting ? (
                <span className="flex items-center gap-1 text-[10px] text-amber-400">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  <span>{isAmharic ? 'መንገድ በማስላት ላይ...' : 'Routing...'}</span>
                </span>
              ) : (
                <>
                  <span className="text-emerald-400 font-bold">{roadDistanceKm} km</span>
                  <span className="text-[9.5px] opacity-75 font-sans font-normal">
                    (🚗 ~{roadDurationMins}m)
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Selected Location Details & Confirmation Footer */}
        <div
          className="p-2.5 sm:p-3.5 border-t space-y-2 shrink-0 bg-black/[0.02] dark:bg-white/[0.02]"
          style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C18A45]">
                  {isAmharic ? 'የተመረጠው አድራሻ:' : 'Assigned Delivery Address:'}
                </span>
                {isReverseGeocoding && (
                  <span className="text-[9px] text-amber-500 animate-pulse flex items-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    <span>Resolving...</span>
                  </span>
                )}
              </div>
              <div className="font-bold text-xs sm:text-sm truncate">
                {resolvedAddress}
              </div>
              <div className="text-[10px] opacity-75 font-mono flex items-center gap-1.5 flex-wrap">
                <span>GPS: {currentLat.toFixed(4)}, {currentLng.toFixed(4)}</span>
                <span>•</span>
                <span className="text-emerald-500 font-bold font-sans">
                  🛣️ {roadDistanceKm} km ({roadDurationMins} {isAmharic ? 'ደቂቃ ጉዞ' : 'mins drive'})
                </span>
                {!isWithinRange && (
                  <span className="text-red-400 font-bold font-sans bg-red-500/15 px-1.5 py-0.2 rounded border border-red-500/20">
                    ⚠️ {isAmharic ? 'ከ30 ኪ.ሜ ማድረሻ ክልል ውጪ' : 'Beyond 30km range'}
                  </span>
                )}
              </div>
            </div>

            {/* Optional Specific House Number / Gate Note */}
            <div className="sm:w-56 shrink-0">
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder={isAmharic ? 'የቤት ቁጥር / መለያ ምልክት...' : 'House # / Landmark (optional)...'}
                className={`w-full px-2.5 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#C18A45] ${
                  isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
                }`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-0.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}
            >
              {isAmharic ? 'ይቅር' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleConfirmLocation}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-black text-xs shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{isAmharic ? 'ይህንን ቦታ አረጋግጥ' : 'Confirm Location'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
