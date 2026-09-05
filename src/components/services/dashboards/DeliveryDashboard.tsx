import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { business } from '../../../config/business';
import {
  Truck,
  ShieldCheck,
  PhoneCall,
  MessageSquare,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getPhoneCallLink } from '../../../utils/formatters';

export const DeliveryDashboard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'design7';

  const [animalType, setAnimalType] = useState<'sheep' | 'goat' | 'cow' | 'multiple'>('sheep');
  const [animalCount, setAnimalCount] = useState('1');
  const [subCity, setSubCity] = useState('Bole');
  const [specificAddress, setSpecificAddress] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const addisSubCities = [
    'Bole',
    'Kirkos / Aware',
    'Yeka / Megenagna',
    'Arada / 4 Kilo / Piazza',
    'Lideta / Mexico',
    'Nifas Silk-Lafto / Sarbet',
    'Kolfe Keranio',
    'Gullele',
    'Akaki Kality',
    'CMC / Ayat / Summit',
    'Bishoftu (Debre Zeyit)',
    'Adama / Nazret'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !specificAddress.trim()) {
      setError('Please provide your name, phone number, and specific delivery address.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  const whatsappMessage = `Hello ${business.name}, I would like to book LIVE LIVESTOCK DELIVERY from Arat Kilo. Details: [${animalCount} ${animalType.toUpperCase()}(s)] to [${subCity}, ${specificAddress}]. Date: ${preferredDate || 'Earliest available'}. Customer: ${customerName} (Phone: ${phone}). Notes: ${notes || 'Please confirm transport schedule.'}`;

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Dashboard Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border ${
          isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold tracking-widest text-amber-500 uppercase">
                Service Dashboard 01
              </span>
              <h2 className={`font-serif font-bold text-xl sm:text-2xl mt-0.5 ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                Live Livestock Delivery Portal
              </h2>
              <p className={`text-xs sm:text-sm mt-1 max-w-xl ${isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'}`}>
                Safe, direct transit from our farm on <strong>Belay Zeleke Street, Arat Kilo, Addis Ababa</strong> to your destination across Addis Ababa and surrounding towns.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={getPhoneCallLink(business.phone)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors ${
                isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Dispatch</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Delivery Booking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Direct Delivery Customization */}
        <div
          className={`lg:col-span-7 p-6 sm:p-7 rounded-3xl border ${
            isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
          }`}
        >
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif font-bold text-xl">Delivery Booking Submitted!</h3>
              <p className="text-xs max-w-md mx-auto opacity-80">
                Thank you <strong>{customerName}</strong>. Our dispatch team in Arat Kilo will contact you at <strong>{phone}</strong> to confirm your vehicle schedule to {subCity}.
              </p>

              <div className="pt-3 flex flex-col sm:flex-row justify-center gap-2.5">
                <a
                  href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                    isDark ? 'bg-[#C58A3A] text-[#1B1208]' : 'bg-[#B8792F] text-[#FAF7F0]'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Instant Confirmation on WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold border opacity-75 hover:opacity-100"
                >
                  Modify Details
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className={`font-serif font-bold text-base border-b pb-2.5 ${isDark ? 'border-[#4A2C16]' : 'border-[#E4D4BC]'}`}>
                Configure Your Live Animal Delivery
              </h3>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. Animal Type & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Animal Type
                  </label>
                  <select
                    value={animalType}
                    onChange={(e) => setAnimalType(e.target.value as any)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  >
                    <option value="sheep">Sheep (በግ)</option>
                    <option value="goat">Goat (ፍየል)</option>
                    <option value="cow">Cow / Cattle (በሬ / ላም)</option>
                    <option value="multiple">Combined Flock / Herd</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Quantity of Animals
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={animalCount}
                    onChange={(e) => setAnimalCount(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>
              </div>

              {/* 2. Destination Sub-City & Specific Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Destination Sub-City / Area <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={subCity}
                    onChange={(e) => setSubCity(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  >
                    {addisSubCities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Specific Landmark / House No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Medhanialem Church or Kebele 02"
                    value={specificAddress}
                    onChange={(e) => setSpecificAddress(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>
              </div>

              {/* 3. Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Preferred Delivery Date
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Contact Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +251 91 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>
              </div>

              {/* 4. Name & Special Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                  Recipient Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Abebe Bekele"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                    isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                  Special Unloading / Gate Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Compound gate code, narrow street entrance, compound grass yard for tethering..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none resize-none ${
                    isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                  }`}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm ${
                    isDark ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]' : 'bg-[#B8792F] hover:bg-[#9E6523] text-[#FAF7F0]'
                  }`}
                >
                  Book Live Animal Delivery
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Key Logistics & Standards */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className={`p-6 rounded-3xl border space-y-3.5 ${
              isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
            }`}
          >
            <h3 className={`font-serif font-bold text-sm sm:text-base flex items-center gap-2 ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Livestock Transport Standards</span>
            </h3>

            <ul className="space-y-2 text-xs opacity-85">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                <span>Custom secure vehicle tailored for gentle, stress-free animal transit.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                <span>Originates directly from Belay Zeleke Street, Arat Kilo, Addis Ababa.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                <span>Experienced farm handlers assist with offloading and yard tethering.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                <span>Distance-based transparent transit fees confirmed prior to departure.</span>
              </li>
            </ul>

            <div className={`pt-3 border-t text-[11px] opacity-70 ${isDark ? 'border-[#4A2C16]' : 'border-[#E4D4BC]'}`}>
              <strong>Coverage Area:</strong> All sub-cities of Addis Ababa, Bishoftu, Dukem, and Adama.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
