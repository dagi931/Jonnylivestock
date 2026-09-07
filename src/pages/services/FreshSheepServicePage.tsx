import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { business } from '../../config/business';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  PhoneCall,
  ArrowLeft,
  PackageCheck
} from 'lucide-react';
import { getPhoneCallLink } from '../../utils/formatters';

export const FreshSheepServicePage: React.FC = () => {
  const { theme } = useTheme();
  const { isAmharic } = useLanguage();
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
      setError(
        isAmharic
          ? 'እባክዎን ስምዎን፣ ስልክ ቁጥርዎንና የማድረሻ አድራሻዎን ያስገቡ።'
          : 'Please provide your name, phone number, and delivery address.'
      );
      return;
    }
    setError('');
    setSubmitted(true);
  };

  const prepTypeLabels: Record<string, string> = {
    whole_carcass: isAmharic ? 'ሙሉ የታረደ በግ' : 'Whole Clean Carcass (ሙሉ የታረደ በግ)',
    four_quarters: isAmharic ? 'በ 4 እግር የተከፋፈለ' : 'Cut into 4 Clean Quarters (4 እግር የተከፋፈለ)',
    custom_cuts: isAmharic ? 'ለጥብስ፣ ለወጥና ለጎድን የተቆራረጠ' : 'Portioned Cuts (የተቆራረጠ - Tibs, Wot, Goden)'
  };

  const whatsappMessage = `Hello ${business.name}, I would like to order FRESHLY SLAUGHTERED SHEEP DELIVERY from Aware. Details: [${sheepCount} Sheep (${breedPreference.toUpperCase()} - ${targetWeight.toUpperCase()} size)]. Preparation: [${prepTypeLabels[prepType]}]. Customer: ${customerName} (Phone: ${phone}). Delivery Address: [${deliveryAddress}]. Date: ${deliveryDate || 'Earliest available'}. Notes: ${specialInstructions || 'Please deliver fresh right after slaughter.'}`;

  return (
    <div className="min-h-screen py-6 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/services"
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
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
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isDark ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]' : 'bg-[#B8792F] hover:bg-[#9E6523] text-[#FAF7F0]'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5 inline mr-1" />
              <span>{isAmharic ? 'ላኪውን ይደውሉ' : 'Call Dispatch'}</span>
            </a>
          </div>
        </div>

        {/* Dedicated Service Hero Banner */}
        <div
          className={`p-6 sm:p-8 rounded-xl border mb-8 ${
            isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold tracking-widest text-amber-500 uppercase">
                  {isAmharic ? 'አገልግሎት 05 ዳሽቦርድ' : 'Service 05 Dashboard'}
                </span>
                <h1 className={`font-serif font-bold text-2xl sm:text-3xl mt-0.5 ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
                  {isAmharic ? 'የታረደ ትኩስ በግ ማድረሻ ዳሽቦርድ' : 'Freshly Slaughtered Sheep Delivery Dashboard'}
                </h1>
                <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'}`}>
                  {isAmharic
                    ? 'የቀጥታ እንስሳትን የመያዝ ወይም በቤት ውስጥ የማረድ ድካምና ቆሻሻ ሳይኖርብዎት፣ ከመላኩ ጥቂት ቀደም ብሎ በአዋሬ እርሻችን በንጽህና የታረደ ትኩስ የበግ ስጋ በቀጥታ ወደ ደጃፍዎ ይደርሳል።'
                    : 'Clean, fresh sheep meat delivered straight to your door without the hassle of live animal handling or home slaughter. We slaughter freshly at our Aware farm just before dispatch.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form */}
          <div
            className={`lg:col-span-7 p-6 sm:p-7 rounded-xl border ${
              isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
            }`}
          >
            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="font-serif font-bold text-xl">
                  {isAmharic ? 'የትኩስ በግ ትዕዛዝዎ በተሳካ ሁኔታ ተልኳል!' : 'Fresh Sheep Order Placed!'}
                </h2>
                <p className="text-xs max-w-md mx-auto opacity-80">
                  {isAmharic ? (
                    <>እናመሰግናለን <strong>{customerName}</strong>። የላኪ ክፍላችን የመረጡትን በግ፣ የቀጥታ ክብደትና የመድረሻ ሰዓት ለማረጋገጥ በ <strong>{phone}</strong> ያነጋግሩዎታል።</>
                  ) : (
                    <>Thank you <strong>{customerName}</strong>. Our dispatch manager will contact you at <strong>{phone}</strong> to confirm your sheep selection, live weight, and delivery arrival time.</>
                  )}
                </p>

                <div className={`p-4 rounded-xl border text-left text-xs space-y-1 ${
                  isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
                }`}>
                  <div><strong>{isAmharic ? 'ትዕዛዝ፡' : 'Order:'}</strong> {sheepCount} {isAmharic ? 'የታረደ ትኩስ በግ' : 'Freshly Slaughtered Sheep'} ({breedPreference})</div>
                  <div><strong>{isAmharic ? 'አዘገጃጀት፡' : 'Preparation:'}</strong> {prepTypeLabels[prepType]}</div>
                  <div><strong>{isAmharic ? 'የማድረሻ አድራሻ፡' : 'Delivery Address:'}</strong> {deliveryAddress}</div>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row justify-center gap-2.5">
                  <a
                    href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
                      isDark ? 'bg-[#C58A3A] text-[#1B1208]' : 'bg-[#B8792F] text-[#FAF7F0]'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{isAmharic ? 'በዋትስአፕ ፈጣን ማረጋገጫ ያግኙ' : 'Confirm on WhatsApp'}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-4 py-2.5 rounded-lg text-xs font-semibold border opacity-75 hover:opacity-100"
                  >
                    {isAmharic ? 'ዝርዝሩን አስተካክል' : 'Modify Details'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                  <h2 className="font-serif font-bold text-base">
                    {isAmharic ? 'የበግ ምርጫና የስጋ ዝግጅት ቅጽ' : 'Select Sheep & Preparation Style'}
                  </h2>
                  <span className="text-[11px] opacity-70">
                    {isAmharic ? 'በአዋሬ ወዲያውኑ የታረደ' : 'Slaughtered Fresh at Aware'}
                  </span>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* 1. Breed Preference & Quantity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                      {isAmharic ? 'የበግ ዝርያ ምርጫ' : 'Preferred Breed'}
                    </label>
                    <select
                      value={breedPreference}
                      onChange={(e) => setBreedPreference(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-lg text-xs border focus:outline-none ${
                        isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                      }`}
                    >
                      <option value="any">{isAmharic ? 'ምርጥ የሚገኝ የበግ ዝርያ' : 'Best Available Prime Sheep'}</option>
                      <option value="debrebirhan">{isAmharic ? 'የደብረ ብርሃን ምርጥ በግ' : 'Debrebirhan Prime Sheep'}</option>
                      <option value="ginchi">{isAmharic ? 'የጊንጪ ደጋ በግ' : 'Ginchi Highland Sheep'}</option>
                      <option value="wolayita">{isAmharic ? 'የወላይታ ዝርያ በግ' : 'Wolayita Breed Sheep'}</option>
                      <option value="arsi">{isAmharic ? 'የአርሲ ምርጥ በግ' : 'Arsi Prime Sheep'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                      {isAmharic ? 'የበጎች ብዛት' : 'Number of Sheep'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={sheepCount}
                      onChange={(e) => setSheepCount(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-lg text-xs border focus:outline-none ${
                        isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                      }`}
                    />
                  </div>
                </div>

                {/* 2. Target Weight Range & Preparation Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                      {isAmharic ? 'የእንስሳው ክብደት መጠን' : 'Target Animal Size'}
                    </label>
                    <select
                      value={targetWeight}
                      onChange={(e) => setTargetWeight(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-lg text-xs border focus:outline-none ${
                        isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                      }`}
                    >
                      <option value="medium">{isAmharic ? 'መካከለኛ (30 – 38 ኪ.ግ በህይወት ሳለ)' : 'Medium (30 – 38 kg live)'}</option>
                      <option value="large">{isAmharic ? 'ትልቅ ምርጥ ሙክት (40 – 50 ኪ.ግ በህይወት ሳለ)' : 'Large Prime (40 – 50 kg live)'}</option>
                      <option value="extra_large">{isAmharic ? 'በጣም ትልቅ ልዩ ሙክት (50+ ኪ.ግ)' : 'Extra Large Trophy Ram (50+ kg)'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                      {isAmharic ? 'የስጋ አቆራረጥና አዘገጃጀት' : 'Preparation & Butchering Style'}
                    </label>
                    <select
                      value={prepType}
                      onChange={(e) => setPrepType(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-lg text-xs border focus:outline-none ${
                        isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                      }`}
                    >
                      <option value="whole_carcass">{isAmharic ? 'ሙሉ የታረደ በግ' : 'Whole Clean Carcass (ሙሉ የታረደ)'}</option>
                      <option value="four_quarters">{isAmharic ? 'በ 4 እግር የተከፋፈለ' : 'Split into 4 Quarters (4 እግር የተከፋፈለ)'}</option>
                      <option value="custom_cuts">{isAmharic ? 'ለጥብስ፣ ለወጥና ለጎድን የተቆራረጠ' : 'Custom Cuts (Tibs, Wot, Ribs Portions)'}</option>
                    </select>
                  </div>
                </div>

                {/* 3. Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                      {isAmharic ? 'ሙሉ ስምዎ' : 'Your Name'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={isAmharic ? 'ለምሳሌ፡ አልማዝ ከበደ' : 'e.g. Almaz Kebede'}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-lg text-xs border focus:outline-none ${
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
                      placeholder="e.g. +251 91 765 4321"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-lg text-xs border focus:outline-none ${
                        isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                      }`}
                    />
                  </div>
                </div>

                {/* 4. Delivery Address & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                      {isAmharic ? 'የማድረሻ አድራሻ / ክፍለ ከተማ' : 'Delivery Address / Sub-City'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={isAmharic ? 'ለምሳሌ፡ ቦሌ ኤድናሞል ወይም አዋሬ' : 'e.g. Addis Ababa, Bole near Edna Mall or Aware'}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-lg text-xs border focus:outline-none ${
                        isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                      {isAmharic ? 'የሚፈልጉበት ቀን' : 'Preferred Delivery Date'}
                    </label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className={`w-full px-3.5 py-2 rounded-lg text-xs border focus:outline-none ${
                        isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    {isAmharic ? 'ልዩ የስጋ አቆራረጥና የማድረሻ መመሪያዎች' : 'Special Butchering / Delivery Instructions'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={isAmharic ? 'ለምሳሌ፡ የተጸዳ ራስና እግር ይካተት፣ ጉበትና ኩላሊት ለብቻ ይታሸግ...' : 'e.g. Include cleaned head/legs, keep liver and kidney in separate clean bag, deliver before 11:00 AM...'}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-lg text-xs border focus:outline-none resize-none ${
                      isDark ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                    }`}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className={`w-full py-3 rounded-lg font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer ${
                      isDark ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]' : 'bg-[#B8792F] hover:bg-[#9E6523] text-[#FAF7F0]'
                    }`}
                  >
                    {isAmharic ? 'የታረደ ትኩስ በግ ይዘዙ' : 'Order Freshly Slaughtered Sheep'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Info */}
          <div className="lg:col-span-5 space-y-4">
            <div
              className={`p-6 rounded-xl border space-y-3.5 ${
                isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
                <PackageCheck className="w-4 h-4" />
                <span>{isAmharic ? 'የእርሻ ዕርድና የትኩስነት ዋስትና' : 'Farm Slaughter & Freshness Guarantee'}</span>
              </div>

              <p className="text-xs opacity-85 leading-relaxed">
                {isAmharic
                  ? 'እያንዳንዱ በግ ጤንነቱ ተመርምሮ በአዋሬ እርሻችን ንጽህና ባለው ባህላዊ ስርዓት ከመላኩ ጥቂት ቀደም ብሎ ይታረዳል፤ ወዲያውኑ በንጹህ የምግብ መሸፈኛ ተጠቅልሎ ይጓጓዛል።'
                  : 'Every sheep is inspected for health, slaughtered freshly at our Aware facility under sanitary traditional standards, and transported immediately in clean food-grade protective wrap.'}
              </p>

              <ul className="space-y-2 text-xs opacity-85 pt-1 border-t" style={{ borderColor: isDark ? '#4A2C16' : '#E4D4BC' }}>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                  <span>{isAmharic ? 'በቤትዎ ምንም ቆሻሻ አይኖርም፡ የእንስሳት እበት፣ ቆዳ መግፈፍና ማጽዳት ጣጣ የለም።' : 'Zero mess at home: no animal waste, skinning, or cleanup needed.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                  <span>{isAmharic ? 'ንጹህ ጉበት፣ ኩላሊትና እጅ እግር እንደፍላጎትዎ ለብቻ ተሸክፎ ይቀርባል።' : 'Clean liver, kidney, and offal packaged separately upon request.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                  <span>{isAmharic ? 'ትኩስ ሆኖ ለምግብ ዝግጅት ወይም ለማቀዝቀዣ ዝግጁ ሆኖ ይደርስዎታል።' : 'Delivered fresh and ready for immediate cooking or freezing.'}</span>
                </li>
              </ul>
            </div>

            {/* Other Services Switcher Quick Links */}
            <div
              className={`p-5 rounded-xl border text-xs space-y-2 ${
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
                <Link to="/services/meat-by-kg" className="hover:underline opacity-80">{isAmharic ? 'ስጋ በኪሎ' : 'Meat in KG'}</Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
