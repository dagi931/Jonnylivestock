import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { business } from '../../../config/business';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  PhoneCall,
  PackageCheck
} from 'lucide-react';
import { getPhoneCallLink } from '../../../utils/formatters';

export const FreshSheepDashboard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'design7';

  const [breedPreference, setBreedPreference] = useState('any');
  const [prepType, setPrepType] = useState('whole_carcass');
  const [sheepCount, setSheepCount] = useState('1');
  const [targetWeight, setTargetWeight] = useState('medium');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !deliveryAddress.trim()) {
      setError('Please provide your name, phone number, and delivery address.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  const prepTypeLabels: Record<string, string> = {
    whole_carcass: 'Whole Clean Carcass (ሙሉ የታረደ በግ)',
    four_quarters: 'Cut into 4 Clean Quarters (4 እግር የተከፋፈለ)',
    custom_cuts: 'Portioned Cuts (የተቆራረጠ - Tibs, Wot, Goden)'
  };

  const whatsappMessage = `Hello ${business.name}, I would like to order FRESHLY SLAUGHTERED SHEEP DELIVERY from Aware. Details: [${sheepCount} Sheep (${breedPreference.toUpperCase()} - ${targetWeight.toUpperCase()} size)]. Preparation: [${prepTypeLabels[prepType]}]. Customer: ${customerName} (Phone: ${phone}). Delivery Address: [${deliveryAddress}]. Date: ${deliveryDate || 'Earliest available'}. Notes: ${specialInstructions || 'Please deliver fresh right after slaughter.'}`;

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
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold tracking-widest text-amber-500 uppercase">
                Service Dashboard 05
              </span>
              <h2 className={`font-serif font-bold text-xl sm:text-2xl mt-0.5 ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                Freshly Slaughtered Sheep Delivery Portal
              </h2>
              <p className={`text-xs sm:text-sm mt-1 max-w-xl ${isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'}`}>
                Enjoy clean, fresh sheep meat delivered straight to your door without the hassle of live animal handling or home slaughter. We slaughter freshly at our Aware farm just before dispatch.
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Fresh Sheep Configuration */}
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
              <h3 className="font-serif font-bold text-xl">Fresh Sheep Order Placed!</h3>
              <p className="text-xs max-w-md mx-auto opacity-80">
                Thank you <strong>{customerName}</strong>. Our dispatch manager will contact you at <strong>{phone}</strong> to confirm your sheep selection, live weight, and delivery arrival time.
              </p>

              <div className={`p-4 rounded-2xl border text-left text-xs space-y-1 ${
                isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
              }`}>
                <div><strong>Order:</strong> {sheepCount} Freshly Slaughtered Sheep ({breedPreference})</div>
                <div><strong>Preparation:</strong> {prepTypeLabels[prepType]}</div>
                <div><strong>Delivery Address:</strong> {deliveryAddress}</div>
              </div>

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
                Select Sheep & Preparation Style
              </h3>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. Breed Preference & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Preferred Breed
                  </label>
                  <select
                    value={breedPreference}
                    onChange={(e) => setBreedPreference(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  >
                    <option value="any">Best Available Prime Sheep</option>
                    <option value="debrebirhan">Debrebirhan Prime Sheep</option>
                    <option value="ginchi">Ginchi Highland Sheep</option>
                    <option value="wolayita">Wolayita Breed Sheep</option>
                    <option value="arsi">Arsi Prime Sheep</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Number of Sheep
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={sheepCount}
                    onChange={(e) => setSheepCount(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>
              </div>

              {/* 2. Target Weight Range & Preparation Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Target Animal Size
                  </label>
                  <select
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  >
                    <option value="medium">Medium (30 – 38 kg live)</option>
                    <option value="large">Large Prime (40 – 50 kg live)</option>
                    <option value="extra_large">Extra Large Trophy Ram (50+ kg)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Preparation & Butchering Style
                  </label>
                  <select
                    value={prepType}
                    onChange={(e) => setPrepType(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  >
                    <option value="whole_carcass">Whole Clean Carcass (ሙሉ የታረደ)</option>
                    <option value="four_quarters">Split into 4 Quarters (4 እግር የተከፋፈለ)</option>
                    <option value="custom_cuts">Custom Cuts (Tibs, Wot, Ribs Portions)</option>
                  </select>
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
                    placeholder="e.g. Almaz Kebede"
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
                    placeholder="e.g. +251 91 765 4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>
              </div>

              {/* 4. Delivery Address & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Delivery Address / Sub-City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Addis Ababa, Bole near Edna Mall or Aware"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Preferred Delivery Date
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                  Special Butchering / Delivery Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Include cleaned head/legs, keep liver and kidney in separate clean bag, deliver before 11:00 AM..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
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
                  Order Freshly Slaughtered Sheep
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Info: Hygiene & Delivery Guarantee */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className={`p-6 rounded-3xl border space-y-3.5 ${
              isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
              <PackageCheck className="w-4 h-4" />
              <span>Farm Slaughter & Freshness Guarantee</span>
            </div>

            <p className="text-xs opacity-85 leading-relaxed">
              Every sheep is inspected for health, slaughtered freshly at our Aware facility under sanitary traditional standards, and transported immediately in clean food-grade protective wrap.
            </p>

            <ul className="space-y-2 text-xs opacity-85 pt-1 border-t" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                <span>Zero mess at home: no animal waste, skinning, or cleanup needed.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                <span>Clean liver, kidney, and offal packaged separately upon request.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                <span>Delivered fresh and ready for immediate cooking or freezing.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};
