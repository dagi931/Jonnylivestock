import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { business } from '../../config/business';
import { ethiopianMealPurposes } from '../../data/services';
import {
  Scale,
  Building2,
  Utensils,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  PhoneCall,
  ArrowLeft
} from 'lucide-react';
import { getPhoneCallLink } from '../../utils/formatters';

export const MeatByKgServicePage: React.FC = () => {
  const { theme } = useTheme();
  const { isAmharic } = useLanguage();
  const isDark = theme === 'design7';

  const [animalSource, setAnimalSource] = useState<'sheep' | 'goat' | 'cow' | 'mixed'>('cow');
  const [selectedMeals, setSelectedMeals] = useState<string[]>(['wot', 'tibs', 'kitfo']);
  
  // Single animal quantity
  const [quantityKg, setQuantityKg] = useState('25');
  
  // Mixed meat individual quantities
  const [sheepKg, setSheepKg] = useState('10');
  const [goatKg, setGoatKg] = useState('10');
  const [cowKg, setCowKg] = useState('20');

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

  const toggleMeal = (id: string) => {
    if (selectedMeals.includes(id)) {
      setSelectedMeals(selectedMeals.filter((m) => m !== id));
    } else {
      setSelectedMeals([...selectedMeals, id]);
    }
  };

  const getMealLabels = () => {
    return selectedMeals
      .map((id) => {
        const found = ethiopianMealPurposes.find((m) => m.id === id);
        if (!found) return id;
        return isAmharic ? found.amharicName : `${found.amharicName} (${found.name})`;
      })
      .join(', ');
  };

  // Calculate mixed total
  const totalMixedKg =
    (parseFloat(sheepKg) || 0) + (parseFloat(goatKg) || 0) + (parseFloat(cowKg) || 0);

  const getQuantityDisplay = () => {
    if (animalSource === 'mixed') {
      return isAmharic
        ? `የተደባለቀ ድምር፡ ${totalMixedKg} ኪ.ግ (በግ፡ ${sheepKg || 0} ኪ.ግ፣ ፍየል፡ ${goatKg || 0} ኪ.ግ፣ በሬ፡ ${cowKg || 0} ኪ.ግ)`
        : `Mixed Total: ${totalMixedKg} KG (Sheep: ${sheepKg || 0}kg, Goat: ${goatKg || 0}kg, Cow: ${cowKg || 0}kg)`;
    }
    const sourceLabel =
      animalSource === 'sheep'
        ? (isAmharic ? 'የበግ' : 'SHEEP')
        : animalSource === 'goat'
        ? (isAmharic ? 'የፍየል' : 'GOAT')
        : (isAmharic ? 'የበሬ' : 'COW');
    return isAmharic
      ? `${quantityKg} ኪ.ግ ${sourceLabel} ስጋ`
      : `${quantityKg} KG of ${sourceLabel} meat`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactPerson.trim() || !phone.trim() || !kitchenAddress.trim()) {
      setError(
        isAmharic
          ? 'እባክዎን ስምዎን ወይም የድርጅትዎን ስም፣ ስልክ ቁጥርዎንና የስጋ ማድረሻ አድራሻዎን ያስገቡ።'
          : 'Please provide your name/business name, phone number, and kitchen delivery address.'
      );
      return;
    }
    if (animalSource === 'mixed' && totalMixedKg <= 0) {
      setError(
        isAmharic
          ? 'እባክዎን ቢያንስ ለአንዱ የስጋ አይነት የኪሎ መጠን ያስገቡ።'
          : 'Please enter at least one kilogram amount for the mixed meats.'
      );
      return;
    }
    setError('');
    setSubmitted(true);
  };

  const whatsappMessage = `Hello ${business.name}, I would like to order MEAT IN KG (Wholesale/Commercial Supply). Order: [${getQuantityDisplay()}]. Meal Purposes: [${getMealLabels() || 'General Cuts'}]. Order Type: [${orderFrequency.toUpperCase()} for ${establishmentType}]. Customer/Business: ${businessName ? `${businessName} (${contactPerson})` : contactPerson} (Phone: ${phone}). Delivery Address: [${kitchenAddress}]. Delivery Date: ${deliveryDate || 'Earliest available'}. Cut Notes: ${cutInstructions || 'Standard portioning'}.`;

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
              <span>{isAmharic ? 'የጅምላ ስጋ አስተባባሪውን ይደውሉ' : 'Call Wholesale Desk'}</span>
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
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold tracking-widest text-amber-500 uppercase">
                  {isAmharic ? 'አገልግሎት 04 ዳሽቦርድ' : 'Service 04 Dashboard'}
                </span>
                <h1 className={`font-serif font-bold text-2xl sm:text-3xl mt-0.5 ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                  {isAmharic
                    ? 'ስጋ በኪሎ አቅርቦት ዳሽቦርድ (ለሆቴሎች፣ ሬስቶራንቶችና ካተሪንጎች)'
                    : 'Meat Supply in KG Dashboard (for Hotels, Restaurants & Catering)'}
                </h1>
                <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'}`}>
                  {isAmharic
                    ? 'ከበግ፣ ፍየል ወይም ሰንጋ በኪሎ ግራም በትክክለኛ ሚዛን ተመዝኖ የተዘጋጀ ትኩስ ስጋ — ለባህላዊ ምግቦች ለምሳሌ ክትፎ፣ ጥሬ ቁርጥ፣ ወጥ፣ ጥብስና ዱለት እንደፍላጎትዎ ተቆራርጦ ይቀርባል።'
                    : 'Fresh, clean meat extracted in kilograms from sheep, goats, or cows — customized for Ethiopian dishes like Kitfo (ክትፎ), Tre Kurt (ጥሬ ቁርጥ), Wot (ወጥ), Tibs (ጥብስ), and Dulet (ዱለት).'}
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
                  {isAmharic ? 'የስጋ በኪሎ ትዕዛዝዎ ደርሶናል!' : 'Meat in KG Order Received!'}
                </h2>
                <p className="text-xs max-w-md mx-auto opacity-80">
                  {isAmharic ? (
                    <>እናመሰግናለን <strong>{contactPerson}</strong>። በአዋሬ የሚገኘው የስጋ አቅርቦት ክፍላችን የጅምላ ዋጋውን፣ የኪሎ ምዘናውንና ማድረሻውን ለማረጋገጥ በ <strong>{phone}</strong> ያነጋግሩዎታል።</>
                  ) : (
                    <>Thank you <strong>{contactPerson}</strong>. Our butchery dispatch in Aware will contact you at <strong>{phone}</strong> to confirm wholesale pricing, kg weighing, and kitchen delivery.</>
                  )}
                </p>

                <div className={`p-4 rounded-2xl border text-left text-xs space-y-1.5 ${
                  isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                }`}>
                  <div><strong>{isAmharic ? 'መጠን፡' : 'Quantity:'}</strong> {getQuantityDisplay()}</div>
                  <div><strong>{isAmharic ? 'የምግብ አይነት፡' : 'Meal Purpose:'}</strong> {getMealLabels() || (isAmharic ? 'መደበኛ አቆራረጥ' : 'General Cuts')}</div>
                  <div><strong>{isAmharic ? 'የማድረሻ አድራሻ፡' : 'Delivery Address:'}</strong> {kitchenAddress}</div>
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
                    <span>{isAmharic ? 'ትዕዛዙን በዋትስአፕ ይላኩ' : 'Send Order on WhatsApp'}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold border opacity-75 hover:opacity-100"
                  >
                    {isAmharic ? 'ትዕዛዙን አስተካክል' : 'Modify Order'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                  <h2 className="font-serif font-bold text-base">
                    {isAmharic ? 'የስጋ አይነትና የዝግጅት ምርጫ' : 'Configure Meat Type & Meal Purpose'}
                  </h2>
                  <span className="text-[11px] opacity-70">
                    {isAmharic ? 'የጅምላና የንግድ አቅርቦት' : 'Wholesale Commercial Supply'}
                  </span>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* 1. Animal Source Selector */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 opacity-90">
                    {isAmharic ? '1. የስጋውን እንስሳ አይነት ይምረጡ' : '1. Select Meat Animal Source'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'sheep', label: isAmharic ? 'የበግ ሥጋ' : 'Sheep (የበግ ሥጋ)' },
                      { id: 'goat', label: isAmharic ? 'የፍየል ሥጋ' : 'Goat (የፍየል ሥጋ)' },
                      { id: 'cow', label: isAmharic ? 'የበሬ ሥጋ' : 'Cow / Beef (የበሬ ሥጋ)' },
                      { id: 'mixed', label: isAmharic ? 'የተደባለቀ ትዕዛዝ' : 'Mixed Order (የተደባለቀ)' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setAnimalSource(item.id as any)}
                        className={`p-2.5 rounded-xl text-center font-bold border transition-all text-xs ${
                          animalSource === item.id
                            ? isDark
                              ? 'bg-[#C58A3A] text-[#1B1208] border-[#C58A3A] shadow-xs'
                              : 'bg-[#B8792F] text-[#FAF7F0] border-[#B8792F] shadow-xs'
                            : isDark
                            ? 'bg-[#1B1208] border-[#4A2C16] text-[#D8C5A8]'
                            : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#746556]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Ethiopian Meal Purpose Checklist */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 opacity-90 flex items-center justify-between">
                    <span>
                      {isAmharic
                        ? '2. የሥጋው ዓይነት ለምን ምግብ እንደሚያገለግል ይምረጡ፡'
                        : '2. Select Meal Purpose / የሥጋው ዓይነት ለምን ምግብ:'}
                    </span>
                    <span className="text-[10px] opacity-60 font-normal">
                      {isAmharic ? 'የሚፈልጉትን ሁሉ ይምረጡ' : 'Select all needed'}
                    </span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ethiopianMealPurposes.map((meal) => {
                      const isChecked = selectedMeals.includes(meal.id);
                      return (
                        <button
                          key={meal.id}
                          type="button"
                          onClick={() => toggleMeal(meal.id)}
                          className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                            isChecked
                              ? isDark
                                ? 'bg-[#4A2C16] border-[#C58A3A] text-[#F4E8D0] ring-1 ring-[#C58A3A]/40'
                                : 'bg-[#F1E8D8] border-[#B8792F] text-[#2A1A0D] ring-1 ring-[#B8792F]/40'
                              : isDark
                              ? 'bg-[#1B1208] border-[#4A2C16] text-[#D8C5A8]/70 hover:text-[#F4E8D0]'
                              : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#746556]/70 hover:text-[#2A1A0D]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            <Utensils className={`w-3 h-3 ${isChecked ? 'text-amber-500' : 'opacity-40'}`} />
                            <span>{meal.amharicName}</span>
                          </div>
                          <span className="text-[10px] opacity-75 font-medium mt-0.5">{meal.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Quantity in KG: Single vs Mixed Breakdown */}
                {animalSource === 'mixed' ? (
                  <div
                    className={`p-4 rounded-2xl border space-y-3 animate-in fade-in-50 duration-200 ${
                      isDark ? 'bg-[#1B1208] border-[#C58A3A]/40' : 'bg-[#FAF7F0] border-[#B8792F]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                        {isAmharic
                          ? '3. የተደባለቀ ትዕዛዝ፡ ለእያንዳንዱ አይነት የኪሎ መጠን ይግለጹ'
                          : '3. Mixed Order: Specify KG Amount for Each Meat Type'}
                      </span>
                      <span className="text-xs font-bold bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-md">
                        {isAmharic ? `ጠቅላላ፡ ${totalMixedKg} ኪ.ግ` : `Total: ${totalMixedKg} KG`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Sheep KG */}
                      <div>
                        <label className="block text-xs font-semibold mb-1 opacity-90">
                          {isAmharic ? 'የበግ ሥጋ' : 'Sheep / Lamb (በግ)'}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="0"
                            value={sheepKg}
                            onChange={(e) => setSheepKg(e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none ${
                              isDark ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                            }`}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold opacity-60">
                            {isAmharic ? 'ኪ.ግ' : 'KG'}
                          </span>
                        </div>
                      </div>

                      {/* Goat KG */}
                      <div>
                        <label className="block text-xs font-semibold mb-1 opacity-90">
                          {isAmharic ? 'የፍየል ሥጋ' : 'Goat (ፍየል)'}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="0"
                            value={goatKg}
                            onChange={(e) => setGoatKg(e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none ${
                              isDark ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                            }`}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold opacity-60">
                            {isAmharic ? 'ኪ.ግ' : 'KG'}
                          </span>
                        </div>
                      </div>

                      {/* Cow KG */}
                      <div>
                        <label className="block text-xs font-semibold mb-1 opacity-90">
                          {isAmharic ? 'የበሬ ሥጋ' : 'Cow / Beef (በሬ)'}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="0"
                            value={cowKg}
                            onChange={(e) => setCowKg(e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none ${
                              isDark ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                            }`}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold opacity-60">
                            {isAmharic ? 'ኪ.ግ' : 'KG'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                        {isAmharic ? '3. የኪሎ ግራም መጠን (ኪ.ግ)' : '3. Quantity in Kilograms (KG)'} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={isAmharic ? 'ለምሳሌ፡ 20 ኪ.ግ፣ 50 ኪ.ግ፣ 200 ኪ.ግ' : 'e.g. 20 kg, 50 kg, 200 kg'}
                          value={quantityKg}
                          onChange={(e) => setQuantityKg(e.target.value)}
                          className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                            isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                          }`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold opacity-60">
                          {isAmharic ? 'ኪ.ግ' : 'KG'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                        {isAmharic ? 'የአቅርቦት ድግግሞሽ' : 'Supply Frequency'}
                      </label>
                      <select
                        value={orderFrequency}
                        onChange={(e) => setOrderFrequency(e.target.value as any)}
                        className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                          isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                        }`}
                      >
                        <option value="one_time">{isAmharic ? 'የአንድ ጊዜ ትዕዛዝ' : 'One-Time Order'}</option>
                        <option value="weekly">{isAmharic ? 'ሳምንታዊ መደበኛ አቅርቦት' : 'Weekly Regular Delivery'}</option>
                        <option value="daily">{isAmharic ? 'ዕለታዊ የሆቴል/ማብሰያ አቅርቦት' : 'Daily Hotel Kitchen Supply'}</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* If mixed, also show frequency below */}
                {animalSource === 'mixed' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                      {isAmharic ? 'የአቅርቦት ድግግሞሽ' : 'Supply Frequency'}
                    </label>
                    <select
                      value={orderFrequency}
                      onChange={(e) => setOrderFrequency(e.target.value as any)}
                      className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                        isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                      }`}
                    >
                      <option value="one_time">{isAmharic ? 'የአንድ ጊዜ ትዕዛዝ' : 'One-Time Order'}</option>
                      <option value="weekly">{isAmharic ? 'ሳምንታዊ መደበኛ አቅርቦት' : 'Weekly Regular Delivery'}</option>
                      <option value="daily">{isAmharic ? 'ዕለታዊ የሆቴል/ማብሰያ አቅርቦት' : 'Daily Hotel Kitchen Supply'}</option>
                    </select>
                  </div>
                )}

                {/* 4. Business/Establishment & Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                      {isAmharic ? 'የገዥው ዘርፍ' : 'Buyer Category'}
                    </label>
                    <select
                      value={establishmentType}
                      onChange={(e) => setEstablishmentType(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                        isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                      }`}
                    >
                      <option value="hotel_restaurant">{isAmharic ? 'ሆቴል / ሬስቶራንት' : 'Hotel / Restaurant'}</option>
                      <option value="catering">{isAmharic ? 'የካተሪንግ ኩሽና' : 'Catering Kitchen'}</option>
                      <option value="household">{isAmharic ? 'የቤተሰብ / የቤት ውስጥ' : 'Household / Family'}</option>
                      <option value="ceremony">{isAmharic ? 'ለድግስ / ለዝግጅት' : 'Ceremony / Feast'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                      {isAmharic ? 'የሆቴሉ / የድርጅቱ ስም' : 'Hotel / Business Name'}
                    </label>
                    <input
                      type="text"
                      placeholder={isAmharic ? 'ለምሳሌ፡ ቦሌ ባህላዊ ሬስቶራንት' : 'e.g. Bole Traditional Restaurant'}
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                        isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                      {isAmharic ? 'የአነጋጋሪው ሙሉ ስም' : 'Contact Person'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={isAmharic ? 'ለምሳሌ፡ ሼፍ ዳዊት' : 'e.g. Chef Dawit'}
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                        isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                      }`}
                    />
                  </div>
                </div>

                {/* 5. Phone & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                      {isAmharic ? 'ስልክ ቁጥር' : 'Phone Number'} <span className="text-red-500">*</span>
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

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                      {isAmharic ? 'የሚፈለግበት ቀን' : 'Delivery Date / Schedule'}
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
                    {isAmharic ? 'የማብሰያ ቤት / የማድረሻ አድራሻ' : 'Kitchen / Delivery Address'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={isAmharic ? 'ለምሳሌ፡ ቦሌ አትላስ ወይም ካዛንቺስ' : 'e.g. Addis Ababa, Bole near Atlas or Kazanchis'}
                    value={kitchenAddress}
                    onChange={(e) => setKitchenAddress(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    {isAmharic ? 'ልዩ የስጋ አቆራረጥና የስጋ ዝግጅት መመሪያዎች' : 'Specific Cut & Butchering Instructions'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={isAmharic ? 'ለምሳሌ፡ ለክትፎ የሚሆን ቀይ ስጋ፣ የጥብስ ስጋ በኩብ የተቆረጠ፣ የጎድን አቆራረጥ...' : 'e.g. Remove sinew from kitfo portions, cut tibs in 2cm cubes, separate goden ribs into 4-rib racks...'}
                    value={cutInstructions}
                    onChange={(e) => setCutInstructions(e.target.value)}
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
                    {isAmharic ? 'የስጋ በኪሎ ትዕዛዝ ይላኩ' : 'Submit Meat in KG Order'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Info */}
          <div className="lg:col-span-5 space-y-4">
            <div
              className={`p-6 rounded-3xl border space-y-3.5 ${
                isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>{isAmharic ? 'የሆቴልና ሬስቶራንት የጅምላ ስጋ መስፈርቶች' : 'Hotel & Kitchen Wholesale Specs'}</span>
              </div>

              <p className="text-xs opacity-85 leading-relaxed">
                {isAmharic
                  ? 'ስጋውን በቀጥታ ጤናማነታቸው ከተረጋገጡ እንስሳት በአዋሬ እርሻችን በከፍተኛ ንጽህናና በትክክለኛ ሚዛን እናዘጋጃለን።'
                  : 'We process meat directly from verified healthy livestock at our Aware facility under strict sanitary conditions with precision weighing.'}
              </p>

              <div className="space-y-2 pt-2 border-t text-xs opacity-90" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                <div className="flex items-center justify-between">
                  <span><strong>{isAmharic ? 'የክትፎ ስጋ፡' : 'Kitfo Cuts:'}</strong></span>
                  <span className="opacity-75">{isAmharic ? '100% ቀይ ንጹህ ስጋ (ፍርምባ / ለጋ)' : '100% lean red meat (ፍርምባ / ለጋ)'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span><strong>{isAmharic ? 'የጥሬ ቁርጥ ስጋ፡' : 'Tre Kurt Cuts:'}</strong></span>
                  <span className="opacity-75">{isAmharic ? 'ምርጥ ኮስታላና ሻንካ' : 'Prime tenderloin & loin (ኮስታላ / ሻንካ)'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span><strong>{isAmharic ? 'የወጥ ስጋ፡' : 'Wot Cuts:'}</strong></span>
                  <span className="opacity-75">{isAmharic ? 'ንጹህ የወጥ ሥጋ' : 'Clean stew meat (የወጥ ሥጋ)'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span><strong>{isAmharic ? 'የጥብስ ስጋ፡' : 'Tibs Cuts:'}</strong></span>
                  <span className="opacity-75">{isAmharic ? 'የለጋ ጥብስ ስጋና የጎድን ቁራጮች' : 'Tender meat & rib strips'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span><strong>{isAmharic ? 'የዱለት ስጋ፡' : 'Dulet Cuts:'}</strong></span>
                  <span className="opacity-75">{isAmharic ? 'ትኩስ ጨጓራ፣ ጉበትና ቀይ ስጋ' : 'Fresh liver, tripe & lean mince'}</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] opacity-70">
                {isAmharic
                  ? '* ለሁሉም ጭነቶች የተረጋገጠ ሚዛን ጥቅም ላይ ይውላል። ቀጣይነት ላላቸው ውሎች ልዩ የማድረሻ ቅናሽ አለ።'
                  : '* Certified scales used on all shipments. Recurring contracts receive discounted delivery rates.'}
              </div>
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
                <Link to="/services/events-ceremonies" className="hover:underline opacity-80">{isAmharic ? 'ለበዓላትና ሰርግ' : 'Ceremony Supply'}</Link>
                <Link to="/services/fresh-slaughtered-sheep" className="hover:underline opacity-80">{isAmharic ? 'የታረደ ትኩስ በግ' : 'Fresh Sheep'}</Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
