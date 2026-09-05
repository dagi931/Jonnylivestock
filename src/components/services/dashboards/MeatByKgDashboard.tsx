import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { business } from '../../../config/business';
import {
  Scale,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  PhoneCall,
  Beef,
  Calculator,
  ShieldCheck
} from 'lucide-react';
import { getPhoneCallLink } from '../../../utils/formatters';

export const MeatByKgDashboard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'design7';

  // Specific Cut Quantities (in KG)
  const [kurtKg, setKurtKg] = useState('5');
  const [kitfoKg, setKitfoKg] = useState('5');
  const [wotKg, setWotKg] = useState('10');

  const [orderFrequency, setOrderFrequency] = useState<'one_time' | 'daily' | 'weekly'>('one_time');
  const [establishmentType, setEstablishmentType] = useState('hotel_restaurant');
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [kitchenAddress, setKitchenAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [cutInstructions, setCutInstructions] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Prices per KG
  const prices: Record<string, number> = {
    kurt: 2800,
    kitfo: 2200,
    wot: 1800
  };

  const parsedKurt = parseFloat(kurtKg) || 0;
  const parsedKitfo = parseFloat(kitfoKg) || 0;
  const parsedWot = parseFloat(wotKg) || 0;

  const totalKg = parsedKurt + parsedKitfo + parsedWot;

  const totalPrice =
    parsedKurt * prices.kurt +
    parsedKitfo * prices.kitfo +
    parsedWot * prices.wot;

  const getOrderSummaryText = () => {
    const parts: string[] = [];
    if (parsedKurt > 0) parts.push(`Kurt: ${parsedKurt}kg (@2,800)`);
    if (parsedKitfo > 0) parts.push(`Kitfo: ${parsedKitfo}kg (@2,200)`);
    if (parsedWot > 0) parts.push(`Wot: ${parsedWot}kg (@1,800)`);
    return parts.join(', ') || 'None';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactPerson.trim() || !phone.trim() || !kitchenAddress.trim()) {
      setError('Please provide your name/business name, phone number, and kitchen delivery address.');
      return;
    }
    if (totalKg <= 0) {
      setError('Please enter at least one kilogram quantity for your beef order.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  const whatsappMessage = `Hello ${business.name}, I would like to order PRIME BEEF IN KG (100% Beef from Oxen).
Order Breakdown: [${getOrderSummaryText()}]
Total Quantity: ${totalKg} KG
Estimated Total: ${totalPrice.toLocaleString()} ETB
Frequency: ${orderFrequency.toUpperCase()} for ${establishmentType}
Customer/Business: ${businessName ? `${businessName} (${contactPerson})` : contactPerson} (Phone: ${phone})
Delivery Address: ${kitchenAddress}
Delivery Date: ${deliveryDate || 'Earliest available'}
Cut Notes: ${cutInstructions || 'Standard portioning'}`;

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
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono font-bold tracking-widest text-amber-500 uppercase">
                  Service Dashboard 04
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  <Beef className="w-3 h-3" />
                  <span>100% Prime Beef Only</span>
                </span>
              </div>
              <h2 className={`font-serif font-bold text-xl sm:text-2xl mt-0.5 ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                Prime Beef Supply in KG (for Hotels, Restaurants & Catering)
              </h2>
              <p className={`text-xs sm:text-sm mt-1 max-w-xl ${isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'}`}>
                Fresh, hygienic 100% prime Beef extracted in kilograms from fattened oxen — <strong>Kurt (2,800 ETB/kg)</strong>, <strong>Kitfo (2,200 ETB/kg)</strong>, <strong>Wot (1,800 ETB/kg)</strong>.
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
              <span>Call Wholesale Desk</span>
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
              <h3 className="font-serif font-bold text-xl">Beef in KG Order Received!</h3>
              <p className="text-xs max-w-md mx-auto opacity-80">
                Thank you <strong>{contactPerson}</strong>. Our butchery dispatch in Arat Kilo will contact you at <strong>{phone}</strong> to confirm wholesale pricing, kg weighing, and delivery.
              </p>

              <div className={`p-4 rounded-2xl border text-left text-xs space-y-2 ${
                isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
              }`}>
                <div><strong>Selected Cuts:</strong> {getOrderSummaryText()}</div>
                <div><strong>Total Quantity:</strong> {totalKg} KG</div>
                <div className="text-sm font-bold text-emerald-500">
                  <strong>Estimated Total Price:</strong> {totalPrice.toLocaleString()} ETB
                </div>
                <div><strong>Delivery Address:</strong> {kitchenAddress}</div>
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
                  <span>Send Order on WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold border opacity-75 hover:opacity-100 cursor-pointer"
                >
                  Modify Order
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                <div>
                  <h3 className="font-serif font-bold text-base">Beef Cuts & Kilogram Calculator</h3>
                  <p className="text-[11px] opacity-70">Enter desired kilograms for each beef cut</p>
                </div>
                <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Live Calculator</span>
                </span>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Cuts Grid */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider opacity-90">
                  1. Prime Beef Cuts & Kilograms (KG)
                </label>
                <div className="space-y-1.5">
                  {[
                    { id: 'kurt', emoji: '🥩', name: 'Tre Kurt / Tere Siga (ጥሬ ቁርጥ)', desc: 'Prime tender raw cuts from oxen', price: 2800, val: kurtKg, set: setKurtKg, parsed: parsedKurt },
                    { id: 'kitfo', emoji: '🍽️', name: 'Kitfo Cut (ክትፎ)', desc: 'Extra-lean red beef without sinew', price: 2200, val: kitfoKg, set: setKitfoKg, parsed: parsedKitfo },
                    { id: 'wot', emoji: '🍲', name: 'Key / Alicha Wot (ወጥ)', desc: 'Rich stew chunks for family pots', price: 1800, val: wotKg, set: setWotKg, parsed: parsedWot }
                  ].map((item) => (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors ${
                        isDark ? 'bg-[#1E1309]/70 border-[#452814]/70 hover:border-amber-500/30' : 'bg-[#FAF7F0] border-[#E8DAC6] hover:border-amber-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base shrink-0 select-none">{item.emoji}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm">{item.name}</span>
                            <span className="font-mono text-emerald-500 font-bold text-xs">
                              {item.price.toLocaleString()} ETB/kg
                            </span>
                          </div>
                          <p className="text-[10.5px] opacity-70 leading-tight truncate">{item.desc}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <div className="relative w-28 sm:w-24">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="0"
                            value={item.val}
                            onChange={(e) => item.set(e.target.value)}
                            className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-bold border focus:outline-none ${
                              isDark ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#F4E8D0]' : 'bg-white border-[#E4D4BC] text-[#2A1A0D]'
                            }`}
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-60">KG</span>
                        </div>
                        <span className="font-mono text-xs opacity-80 min-w-[70px] text-right">
                          {(item.parsed * item.price).toLocaleString()} ETB
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live calculation bar */}
                <div className={`p-3 rounded-2xl border flex items-center justify-between ${
                  isDark ? 'bg-[#351E0E] border-amber-500/40 text-[#F4E8D0]' : 'bg-[#FAF3E8] border-amber-500/40 text-[#2A1A0D]'
                }`}>
                  <div>
                    <span className="text-[11px] opacity-75 block">Total Weight:</span>
                    <span className="font-bold font-mono">{totalKg} KG</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] opacity-75 block">Estimated Total:</span>
                    <span className="font-bold font-mono text-emerald-500 text-base">
                      {totalPrice.toLocaleString()} ETB
                    </span>
                  </div>
                </div>
              </div>

              {/* Supply Frequency & Buyer Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Supply Frequency
                  </label>
                  <select
                    value={orderFrequency}
                    onChange={(e) => setOrderFrequency(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  >
                    <option value="one_time">One-Time Order</option>
                    <option value="weekly">Weekly Regular Delivery</option>
                    <option value="daily">Daily Hotel Kitchen Supply</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Buyer Category
                  </label>
                  <select
                    value={establishmentType}
                    onChange={(e) => setEstablishmentType(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  >
                    <option value="hotel_restaurant">Hotel / Restaurant</option>
                    <option value="catering">Catering Kitchen</option>
                    <option value="household">Household / Family</option>
                    <option value="ceremony">Ceremony / Feast</option>
                  </select>
                </div>
              </div>

              {/* Business Name & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Hotel / Business Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bole Traditional Restaurant"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chef Dawit"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>
              </div>

              {/* Phone & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +251 91 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    Delivery Date / Schedule
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>
              </div>

              {/* Kitchen Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                  Kitchen / Delivery Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Addis Ababa, Bole near Atlas or Kazanchis"
                  value={kitchenAddress}
                  onChange={(e) => setKitchenAddress(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                    isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                  }`}
                />
              </div>

              {/* Butchering Instructions */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                  Specific Cut & Butchering Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Fine trim without sinew for kitfo, thick prime portions for kurt, lean stew cubes for wot..."
                  value={cutInstructions}
                  onChange={(e) => setCutInstructions(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none resize-none ${
                    isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                  }`}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer ${
                    isDark ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]' : 'bg-[#B8792F] hover:bg-[#9E6523] text-[#FAF7F0]'
                  }`}
                >
                  Submit Beef in KG Order
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Info */}
        <div className="lg:col-span-5 space-y-4">
          {/* Official Price Card */}
          <div
            className={`p-6 rounded-3xl border space-y-3.5 ${
              isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
              <Beef className="w-4 h-4" />
              <span>Official Beef Prices per KG</span>
            </div>

            <div className="space-y-2 pt-2 border-t text-xs opacity-90" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
              <div className="flex items-center justify-between py-1 border-b border-black/5 dark:border-white/5">
                <span><strong>🥩 Tre Kurt (ቁርጥ):</strong></span>
                <span className="font-mono text-emerald-500 font-extrabold text-sm">2,800 ETB / kg</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-black/5 dark:border-white/5">
                <span><strong>🍽️ Kitfo Cut (ክትፎ):</strong></span>
                <span className="font-mono text-emerald-500 font-extrabold text-sm">2,200 ETB / kg</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span><strong>🍲 Wot Stew (ወጥ):</strong></span>
                <span className="font-mono text-emerald-500 font-extrabold text-sm">1,800 ETB / kg</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] opacity-75">
              * The seller currently provides 100% prime Beef (from fattened Debrebirhan & Arsi cattle). All orders measured on certified digital scales.
            </div>
          </div>

          {/* Quality Card */}
          <div
            className={`p-5 rounded-3xl border text-xs space-y-2.5 ${
              isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-amber-500 text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Our Quality Guarantee</span>
            </div>
            <ul className="space-y-1.5 opacity-80 list-disc list-inside">
              <li>Well-fattened prime healthy cattle</li>
              <li>Hygienically slaughtered & vacuum packed</li>
              <li>Refrigerated transit straight to your kitchen</li>
              <li>Bulk discounts for recurring hotel contracts</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};
