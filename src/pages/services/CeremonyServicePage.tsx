import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { business } from '../../config/business';
import {
  PartyPopper,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  PhoneCall,
  ArrowLeft
} from 'lucide-react';
import { getPhoneCallLink } from '../../utils/formatters';

export const CeremonyServicePage: React.FC = () => {
  const { theme } = useTheme();
  const { isAmharic } = useLanguage();
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
    {
      id: 'holiday_enkutatash',
      label: isAmharic ? 'እንቁጣጣሽ (አዲስ ዓመት)' : 'Ethiopian New Year (Enkutatash)'
    },
    {
      id: 'holiday_genna',
      label: isAmharic ? 'ገና' : 'Ethiopian Christmas (Genna)'
    },
    {
      id: 'holiday_fasika',
      label: isAmharic ? 'ትንሳኤ (ፋሲካ)' : 'Easter (Fasika)'
    },
    {
      id: 'holiday_eid',
      label: isAmharic ? 'አረፋ / ኢድ አል-አድሃ / ኢድ አል-ፊጥር' : 'Eid al-Adha / Arefa / Eid al-Fitr'
    },
    {
      id: 'wedding',
      label: isAmharic ? 'ሰርግ / መልስ / የደስታ ድግስ' : 'Wedding / Serg Celebration'
    },
    {
      id: 'funeral_memorial',
      label: isAmharic ? 'ሀዘን / ተዝካር' : 'Funeral, Memorial (Tazie / Teskar)'
    },
    {
      id: 'banquet_family',
      label: isAmharic ? 'ትልቅ የቤተሰብ ዝግጅትና ድግስ' : 'Large Family Gathering / Feast'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !venueLocation.trim()) {
      setError(
        isAmharic
          ? 'እባክዎን ስምዎን፣ ስልክ ቁጥርዎንና የዝግጅቱን አድራሻ ያስገቡ።'
          : 'Please provide your name, phone number, and venue location.'
      );
      return;
    }
    setError('');
    setSubmitted(true);
  };

  const whatsappMessage = `Hello ${business.name}, I would like to arrange CEREMONIAL LIVESTOCK SUPPLY. Event: [${eventType.toUpperCase()}]. Animals: [Sheep: ${sheepCount}, Goats: ${goatCount}, Cows: ${cowCount}]. Date: ${eventDate || 'Upcoming date'}. Venue: [${venueLocation}]. Need On-Site Worker Assistance: [${needWorker ? 'Yes' : 'No'}]. Customer: ${customerName} (Phone: ${phone}). Special Note: ${specialRequests || 'Please allocate and hold prime animals.'}`;

  return (
    <div className="min-h-screen py-6 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/services"
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              isDark
                ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#F4E8D0] hover:border-[#C58A3A]'
                : 'bg-[#F1E8D8] border-[#E4D4BC] text-[#2A1A0D] hover:border-[#B8792F]'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isAmharic ? 'ወደ ሁሉም አገልግሎቶች ተመለስ' : 'Back to All Services'}</span>
          </Link>

          <div className="flex items-center gap-2">
            <a
              href={getPhoneCallLink(business.phone)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isDark ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]' : 'bg-[#B8792F] hover:bg-[#9E6523] text-[#FAF7F0]'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5 inline mr-1" />
              <span>{isAmharic ? 'የዝግጅት አስተባባሪውን ይደውሉ' : 'Call Event Desk'}</span>
            </a>
          </div>
        </div>

        {/* Dedicated Service Hero Banner */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border mb-8 ${
            isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <PartyPopper className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold tracking-widest text-amber-500 uppercase">
                  {isAmharic ? 'አገልግሎት 03 ዳሽቦርድ' : 'Service 03 Dashboard'}
                </span>
                <h1 className={`font-serif font-bold text-2xl sm:text-3xl mt-0.5 ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                  {isAmharic ? 'ለበዓላት፣ ለሰርግና ለተለያዩ ዝግጅቶች የእንስሳት አቅርቦት ዳሽቦርድ' : 'Holidays, Weddings & Funeral Ceremonies Supply Dashboard'}
                </h1>
                <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'}`}>
                  {isAmharic
                    ? 'የተመረጡ በጎች፣ ፍየሎችና ወፍራም ሰንጋዎችን በአዋሬ እርሻችን የማቆየትና የመመገብ ዋስትና፣ በተዘጋጀ ተሽከርካሪ ወደ ዝግጅት ቦታዎ ማድረስና የባለሙያ ዕርድ ድጋፍ ያካትታል።'
                    : 'Reserve prime sheep, goats, and heavy cattle with holding guarantee at Aware, coordinated vehicle delivery to your venue, and optional on-site butchering worker support.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
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
                <h2 className="font-serif font-bold text-xl">
                  {isAmharic ? 'የዝግጅት እንስሳት ጥያቄዎ ደርሶናል!' : 'Ceremonial Supply Request Received!'}
                </h2>
                <p className="text-xs max-w-md mx-auto opacity-80">
                  {isAmharic ? (
                    <>እናመሰግናለን <strong>{customerName}</strong>። የእንስሳት ምደባውን፣ የመድረሻ ሰዓቱንና የባለሙያ እገዛውን ለማረጋገጥ በ <strong>{phone}</strong> ያነጋግሩዎታል።</>
                  ) : (
                    <>Thank you <strong>{customerName}</strong>. We will contact you at <strong>{phone}</strong> to confirm your animal allocation, arrival schedule, and worker assistance.</>
                  )}
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
                    <span>{isAmharic ? 'በዋትስአፕ ፈጣን ማረጋገጫ ያግኙ' : 'Confirm on WhatsApp'}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border opacity-75 hover:opacity-100"
                  >
                    {isAmharic ? 'ዝርዝሩን አስተካክል' : 'Modify Details'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                  <h2 className="font-serif font-bold text-base">
                    {isAmharic ? 'የዝግጅት የእንስሳት ምደባ ቅጽ' : 'Configure Ceremonial Livestock Allocation'}
                  </h2>
                  <span className="text-[11px] opacity-70">
                    {isAmharic ? 'በእርሻው ላይ ማቆየትና መመገብ' : 'Holding & Feeding at Farm'}
                  </span>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* 1. Ceremony Type */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    {isAmharic ? 'የዝግጅቱን አይነት ይምረጡ' : 'Select Ceremony / Occasion Type'}
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
                      {isAmharic ? 'በግ' : 'Sheep (በግ)'}
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
                      {isAmharic ? 'ፍየል' : 'Goats (ፍየል)'}
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
                      {isAmharic ? 'ከብት / ሰንጋ' : 'Cows/Oxen (ከብት)'}
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
                      {isAmharic ? 'የዝግጅቱ ቦታ / አዳራሽ / አካባቢ' : 'Venue Location / Area'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={isAmharic ? 'ለምሳሌ፡ ካዛንቺስ አዳራሽ ወይም ቦሌ ቤት' : 'e.g. Kazanchis Banquet Hall or Bole House'}
                      value={venueLocation}
                      onChange={(e) => setVenueLocation(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                        isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                      {isAmharic ? 'የዝግጅቱ / የድግሱ ቀን' : 'Ceremony / Feast Date'}
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
                      {isAmharic ? 'የአዘጋጁ ሙሉ ስም' : 'Organizer Name'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={isAmharic ? 'ለምሳሌ፡ ዮናስ ግርማ' : 'e.g. Yonas Girma'}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                        isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                      {isAmharic ? 'ስልክ ቁጥር' : 'Phone Number'} <span className="text-red-500">*</span>
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
                    <strong className="block font-semibold">
                      {isAmharic ? 'የዕርድና የስጋ ዝግጅት ባለሙያ ይካተት' : 'Include Dedicated On-Site Slaughter Worker'}
                    </strong>
                    <span className="opacity-75 text-[11px]">
                      {isAmharic
                        ? 'ባለሙያው በዝግጅት ቦታዎ ድረስ መጥቶ ንጹህ ዕርድ፣ ቆዳ መግፈፍና ስጋ ማዘጋጀት ያከናውናል።'
                        : 'Worker handles sanitary slaughter and cut prep directly at your ceremony venue.'}
                    </span>
                  </div>
                </label>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    {isAmharic ? 'ተጨማሪ ማስታወሻዎች / የተለየ የእንስሳ ዝርያ' : 'Special Notes / Preferred Breeds'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={isAmharic ? 'ለምሳሌ፡ የሆሮ ሙክት፣ በጠዋት እንዲደርስ...' : 'e.g. Prefer heavy fat-tailed Horro rams, specific arrival morning timing...'}
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
                    {isAmharic ? 'ለዝግጅት የሚሆኑ እንስሳትን ያስይዙ' : 'Reserve Ceremony Livestock'}
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
                <span>{isAmharic ? 'የዝግጅት የእንስሳት ምደባ ዋስትና' : 'Ceremony Allocation Guarantee'}</span>
              </h3>

              <p className="text-xs opacity-85 leading-relaxed">
                {isAmharic
                  ? 'ያስያዟቸውን እንስሳት በበዓላት ወቅት ከሚከሰተው የገበያ መወደድና እጥረት ነፃ ሆነው እስከ ዝግጅቱ ቀን ድረስ በአዋሬ እርሻችን በመመገብ በክብር እናቆይሎታለን።'
                  : 'We hold and feed your reserved animals at our farm in Aware until your scheduled date, protecting you from last-minute holiday price spikes and rush shortages.'}
              </p>

              <ul className="space-y-2 text-xs opacity-85 pt-1 border-t" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                  <span>{isAmharic ? 'የምርጥ ጥራት ያላቸው በጎች፣ ፍየሎችና ሰንጋዎች ቅድሚያ ምርጫ።' : 'Priority selection of prime quality sheep, goats, and bulls.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                  <span>{isAmharic ? 'በተያዘለት ሰዓት በቀጥታ ወደ ዝግጅት ቦታዎ አስተማማኝ ማድረስ።' : 'Guaranteed on-time convoy delivery directly to your venue.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                  <span>{isAmharic ? 'ልምድ ያላቸው ረዳቶች እንስሳትን የማውረድና የማሰር እገዛ ያደርጋሉ።' : 'Experienced farm handlers assist with smooth unloading and tying.'}</span>
                </li>
              </ul>
            </div>

            {/* Other Services Switcher Quick Links */}
            <div
              className={`p-5 rounded-3xl border text-xs space-y-2 ${
                isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
              }`}
            >
              <span className="font-bold text-amber-500 uppercase tracking-wider text-[10px]">
                {isAmharic ? 'ሌሎች አገልግሎቶችን ይመልከቱ' : 'Explore Other Dashboards'}
              </span>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link to="/services/delivery" className="hover:underline opacity-80">{isAmharic ? 'የቀጥታ ማድረስ' : 'Live Delivery'}</Link>
                <Link to="/services/slaughter-prep" className="hover:underline opacity-80">{isAmharic ? 'በቦታው ላይ ዕርድ' : 'On-Site Slaughter'}</Link>
                <Link to="/services/meat-by-kg" className="hover:underline opacity-80">{isAmharic ? 'ስጋ በኪሎ' : 'Meat in KG'}</Link>
                <Link to="/services/fresh-slaughtered-sheep" className="hover:underline opacity-80">{isAmharic ? 'የታረደ ትኩስ በግ' : 'Fresh Sheep'}</Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
