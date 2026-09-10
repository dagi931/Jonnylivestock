import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { business } from '../../../config/business';
import {
  UtensilsCrossed,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  PhoneCall
} from 'lucide-react';
import { getPhoneCallLink } from '../../../utils/formatters';

export const SlaughterPrepDashboard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'design7';

  const [animalType, setAnimalType] = useState<'sheep' | 'goat' | 'cow'>('sheep');
  const [serviceLocation, setServiceLocation] = useState<'on_site' | 'farm_slaughter'>('on_site');
  const [address, setAddress] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [cutPreferences, setCutPreferences] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setError('Please provide your name, phone number, and service address.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  const whatsappMessage = `Hello ${business.name}, I would like to book a DEDICATED WORKER for SLAUGHTER & MEAT PREPARATION. Details: [1 ${animalType.toUpperCase()}] at [${address}]. Execution Mode: [${serviceLocation === 'on_site' ? 'At My Compound / On-Site' : 'Slaughter at Arat Kilo Facility & Deliver Prepared'}]. Date: ${preferredDate || 'Earliest available'}. Cut Notes: ${cutPreferences || 'Standard butchering'}. Customer: ${customerName} (Phone: ${phone}).`;

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
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold tracking-widest text-amber-500 uppercase">
                Service Dashboard 02
              </span>
              <h2 className={`font-serif font-bold text-xl sm:text-2xl mt-0.5 ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                On-Site Slaughter & Meat Preparation
              </h2>
              <p className={`text-xs sm:text-sm mt-1 max-w-xl ${isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'}`}>
                One dedicated, professional slaughter worker is dispatched to personally perform the respectful sanitary slaughter and complete meat extraction, trimming, and custom butchering.
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
              <span>Call Worker Dispatch</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Direct Worker Request */}
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
              <h3 className="font-serif font-bold text-xl">Worker Dispatch Requested!</h3>
              <p className="text-xs max-w-md mx-auto opacity-80">
                Thank you <strong>{customerName}</strong>. Our team will confirm your assigned worker and scheduling at <strong>{phone}</strong>.
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
                Book Assigned Worker & Processing
              </h3>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. Animal Type & Execution Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Animal to Process
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
                    <option value="cow">Cattle / Ox (በሬ / ከብት)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Service Location
                  </label>
                  <select
                    value={serviceLocation}
                    onChange={(e) => setServiceLocation(e.target.value as any)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  >
                    <option value="on_site">Dispatched to My Home / Venue</option>
                    <option value="farm_slaughter">Process at Arat Kilo Facility & Deliver</option>
                  </select>
                </div>
              </div>

              {/* 2. Service Address & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Service Address / Sub-City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Addis Ababa, Bole near Edna Mall"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Preferred Date
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
              </div>

              {/* 3. Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Helen Gebremariam"
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
                    placeholder="e.g. +251 92 456 7890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>
              </div>

              {/* 4. Custom Cut Preferences */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                  Custom Butchering & Packaging Preferences
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Separate Tibs cuts, rib chops, mince dulet ingredients, keep liver and kidney separate..."
                  value={cutPreferences}
                  onChange={(e) => setCutPreferences(e.target.value)}
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
                  Request Assigned Worker
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Info: Single Dedicated Worker Guarantee */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className={`p-6 rounded-3xl border space-y-3.5 ${
              isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-green-500 uppercase tracking-wider">
              <UserCheck className="w-4 h-4" />
              <span>1 Worker Assigned Per Order</span>
            </div>

            <p className="text-xs leading-relaxed opacity-85">
              Our facility maintains multiple certified, experienced workers. When you book this service, <strong>one dedicated worker takes full ownership</strong> from respectful slaughter to clean extraction, cut trimming, and neat packaging.
            </p>

            <ul className="space-y-2 text-xs opacity-85 pt-1 border-t" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                <span>Sanitary, respectful process adhering to religious & traditional standards.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                <span>Expert skinning, deboning, and customized cut portions.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                <span>Clean workplace management and hygienic packaging provided.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};
