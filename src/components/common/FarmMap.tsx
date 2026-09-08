import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { business } from '../../config/business';
import {
  MapPin,
  Navigation,
  Copy,
  Check,
  ExternalLink,
  Compass,
  Car,
  Route
} from 'lucide-react';

export const FarmMap: React.FC = () => {
  const { theme } = useTheme();
  const { isAmharic } = useLanguage();
  const isDark = theme === 'design7';

  const [copied, setCopied] = useState(false);

  // Exact coordinates moved slightly right directly onto Queen Elizabeth Street / Dejazmach Wolde Gebriel St junction
  const latitude = 9.0314;
  const longitude = 38.7725;
  const coordsString = `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`;

  // OpenStreetMap embed URL centered precisely on the road junction
  const deltaLon = 0.0065;
  const deltaLat = 0.0045;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${(longitude - deltaLon).toFixed(5)}%2C${(latitude - deltaLat).toFixed(5)}%2C${(longitude + deltaLon).toFixed(5)}%2C${(latitude + deltaLat).toFixed(5)}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  
  // Navigation & Direct Map Links
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  const googleMapsViewUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${latitude}, ${longitude}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-3xl border overflow-hidden transition-all shadow-sm ${
        isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
      }`}
    >
      {/* Map Header & Controls */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`font-serif font-bold text-base ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
              {isAmharic ? 'የእርሻው ትክክለኛ መገኛ ካርታ' : 'Live GIS Map & Exact Location'}
            </h2>
            <p className={`text-xs ${isDark ? 'text-[#D8C5A8]/80' : 'text-[#54473A]'}`}>
              {isAmharic
                ? 'በላይ ዘለቀ መንገድ፣ አራት ኪሎ፣ አዲስ አበባ'
                : 'Belay Zeleke Street, Arat Kilo, Addis Ababa'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Copy GPS */}
          <button
            type="button"
            onClick={handleCopyCoords}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              isDark
                ? 'bg-[#1B1208] border-[#4A2C16] text-[#D8C5A8] hover:text-[#F4E8D0]'
                : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#54473A] hover:text-[#2A1A0D]'
            }`}
            title="Copy GPS coordinates"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (isAmharic ? 'ኮኦርዲኔቱ ተቀድቷል' : 'Copied GPS') : coordsString}</span>
          </button>

          {/* Get Driving Directions */}
          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={isAmharic ? 'የመኪና አቅጣጫ በጉግል ካርታ ይመልከቱ' : 'Get driving directions to Jonny Livestock in Google Maps'}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs transform hover:-translate-y-0.5 ${
              isDark
                ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]'
                : 'bg-[#8A4B08] hover:bg-[#6D3A05] text-[#FAF7F0]'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{isAmharic ? 'የመኪና አቅጣጫ አሳይ' : 'Get Driving Directions'}</span>
          </a>
        </div>
      </div>

      {/* Interactive GIS Map Viewport */}
      <div
        className="relative w-full h-[320px] sm:h-[380px] bg-stone-900"
        style={{ minHeight: '320px', contain: 'size layout' }}
      >
        <iframe
          title="Jonny Livestock Exact Location - Belay Zeleke Street, Arat Kilo, Addis Ababa"
          src={osmEmbedUrl}
          className="w-full h-full border-0"
          loading="lazy"
        />

        {/* Floating Farm Location Card */}
        <div className="absolute top-3 left-3 z-10 max-w-xs p-3.5 rounded-2xl bg-black/85 backdrop-blur-md text-[#FAF7F0] border border-white/15 shadow-xl text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-serif font-bold text-sm text-[#E0B15A]">
            <MapPin className="w-4 h-4 text-red-500 shrink-0" />
            <span>{business.name}</span>
          </div>
          <p className="text-[11px] opacity-85 leading-snug">
            {isAmharic
              ? 'በላይ ዘለቀ መንገድ፣ አራት ኪሎ፣ አዲስ አበባ'
              : 'Belay Zeleke Street, Arat Kilo, Addis Ababa'}
          </p>
          <div className="pt-1 flex items-center gap-2 text-[10px] text-green-400 font-semibold border-t border-white/10">
            <span>● {isAmharic ? 'ለደንበኞች ጉብኝትና ርክክብ ክፍት ነው' : 'Open for Customer Visits & Pickup'}</span>
          </div>
        </div>

        {/* External Map Action Badge */}
        <div className="absolute bottom-3 right-3 z-10">
          <a
            href={googleMapsViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={isAmharic ? 'የእርሻውን መገኛ በሙሉ ጉግል ካርታ ይክፈቱ' : 'Open Jonny Livestock location in full Google Maps view'}
            className="px-3.5 py-1.5 rounded-xl bg-black/85 backdrop-blur-md text-[#FAF7F0] border border-white/20 text-xs font-semibold flex items-center gap-1.5 hover:bg-black transition-colors shadow-md"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#E0B15A]" />
            <span>{isAmharic ? 'በሙሉ ካርታ ክፈት' : 'Open in Full Map'}</span>
          </a>
        </div>
      </div>

      {/* Navigation Directions & Access Tips */}
      <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
        <div className="flex items-start gap-2.5">
          <Route className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <strong className="block font-semibold">{isAmharic ? 'ቀጥታ የመንገድ መዳረሻ' : 'Direct Road Access'}</strong>
            <span className="opacity-75">
              {isAmharic
                ? 'በአራት ኪሎ በላይ ዘለቀ መንገድ ላይ በቀጥታ ይገኛል።'
                : 'Directly on Belay Zeleke Street, Arat Kilo, Addis Ababa.'}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Car className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <strong className="block font-semibold">{isAmharic ? 'የተሽከርካሪ መግቢያና ማቆሚያ' : 'Vehicle Access & Parking'}</strong>
            <span className="opacity-75">
              {isAmharic
                ? 'ከብቶችንና በጎችን በቀላሉ ለመጫን የመኪና ማቆሚያ ቦታ አለው።'
                : 'Roadside pull-in and direct parking space for easy animal loading.'}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Navigation className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <strong className="block font-semibold">{isAmharic ? 'ቀጠሮ ይዘው ይጎብኙ' : 'Scheduled Visiting'}</strong>
            <span className="opacity-75">
              {isAmharic
                ? 'እባክዎ ከመምጣትዎ በፊት በስልክ ያሳውቁን።'
                : 'Please contact us before arriving so our farm workers can welcome you on-site.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
