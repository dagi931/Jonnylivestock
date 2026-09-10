import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { business } from '../../../config/business';
import {
  PartyPopper,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  PhoneCall
} from 'lucide-react';
import { getPhoneCallLink } from '../../../utils/formatters';

export const CeremonyDashboard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'design7';

  const [eventType, setEventType] = useState('wedding');
  const [sheepCount, setSheepCount] = useState('2');
  const [goatCount, setGoatCount] = useState('0');
  const [cowCount, setCowCount] = useState('1');
  const [needWorker, setNeedWorker] = useState(true);
  const [eventDate, setEventDate] = useState('');
  const [venueLocation, setVenueLocation] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const eventTypes = [
    { id: 'holiday_enkutatash', label: 'Ethiopian New Year (Enkutatash)' },
    { id: 'holiday_genna', label: 'Ethiopian Christmas (Genna)' },
    { id: 'holiday_fasika', label: 'Easter (Fasika)' },
    { id: 'holiday_eid', label: 'Eid al-Adha / Arefa / Eid al-Fitr' },
    { id: 'wedding', label: 'Wedding / Serg Celebration' },
    { id: 'funeral_memorial', label: 'Funeral, Memorial (Tazie / Teskar)' },
    { id: 'banquet_family', label: 'Large Family Gathering / Feast' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !venueLocation.trim()) {
      setError('Please provide your name, phone number, and venue location.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  const whatsappMessage = `Hello ${business.name}, I would like to arrange CEREMONIAL LIVESTOCK SUPPLY. Event: [${eventType.toUpperCase()}]. Animals: [Sheep: ${sheepCount}, Goats: ${goatCount}, Cattle: ${cowCount}]. Date: ${eventDate || 'Upcoming date'}. Venue: [${venueLocation}]. Need On-Site Worker Assistance: [${needWorker ? 'Yes' : 'No'}]. Customer: ${customerName} (Phone: ${phone}). Special Note: ${specialRequests || 'Please allocate and hold prime animals.'}`;

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border ${
          isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <PartyPopper className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold tracking-widest text-amber-500 uppercase">
                Service Dashboard 03
              </span>
              <h2 className={`font-serif font-bold text-xl sm:text-2xl mt-0.5 ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                Holidays, Weddings & Funeral Ceremonies Supply
              </h2>
              <p className={`text-xs sm:text-sm mt-1 max-w-xl ${isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'}`}>
                Advance reservation of prime sheep, goats, and heavy cattle with coordinated timed delivery to your ceremony venue and optional on-site butchering worker support.
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
              <span>Call Event Manager</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form */}
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
              <h3 className="font-serif font-bold text-xl">Ceremonial Supply Request Received!</h3>
              <p className="text-xs max-w-md mx-auto opacity-80">
                Thank you <strong>{customerName}</strong>. We will contact you at <strong>{phone}</strong> to confirm your animal allocation, arrival schedule, and worker assistance.
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
                  <span>Confirm on WhatsApp</span>
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
                Configure Ceremonial Livestock Allocation
              </h3>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. Ceremony Type */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                  Select Ceremony / Occasion Type
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                    isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                  }`}
                >
                  {eventTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* 2. Number of Animals Needed */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold mb-1 opacity-90">
                    Sheep (በግ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={sheepCount}
                    onChange={(e) => setSheepCount(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border text-center font-bold ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1 opacity-90">
                    Goats (ፍየል)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={goatCount}
                    onChange={(e) => setGoatCount(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border text-center font-bold ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold mb-1 opacity-90">
                    Cattles/Oxen (ከብት)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={cowCount}
                    onChange={(e) => setCowCount(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border text-center font-bold ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>
              </div>

              {/* 3. Venue Location & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Venue Location / Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kazanchis Banquet Hall or Bole House"
                    value={venueLocation}
                    onChange={(e) => setVenueLocation(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Ceremony / Feast Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>
              </div>

              {/* 4. Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Organizer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Yonas Girma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +251 93 111 2233"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>
              </div>

              {/* 5. Include Worker Assistance Toggle */}
              <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer select-none ${
                needWorker
                  ? isDark ? 'bg-[#4A2C16]/50 border-[#C58A3A]' : 'bg-[#F1E8D8] border-[#B8792F]'
                  : isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
              }`}>
                <input
                  type="checkbox"
                  checked={needWorker}
                  onChange={(e) => setNeedWorker(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500"
                />
                <div className="text-xs">
                  <strong className="block font-semibold">Include Dedicated On-Site Slaughter Worker</strong>
                  <span className="opacity-75 text-[11px]">Worker handles sanitary slaughter and cut prep directly at your ceremony venue.</span>
                </div>
              </label>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                  Special Notes / Preferred Breeds
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Prefer heavy Debrebirhan rams, specific arrival morning timing..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
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
                  Reserve Ceremony Livestock
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Holiday Assurance */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className={`p-6 rounded-3xl border space-y-3.5 ${
              isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
            }`}
          >
            <h3 className={`font-serif font-bold text-sm sm:text-base flex items-center gap-2 ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Ceremony Allocation Guarantee</span>
            </h3>

            <p className="text-xs opacity-85 leading-relaxed">
              We hold and feed your reserved animals at our facility in Arat Kilo until your scheduled date, protecting you from last-minute holiday price spikes and rush shortages.
            </p>

            <ul className="space-y-2 text-xs opacity-85 pt-1 border-t" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                <span>Priority selection of prime quality sheep, goats, and bulls.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                <span>Guaranteed on-time convoy delivery directly to your venue.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                <span>Experienced livestock handlers assist with smooth unloading and tying.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};
