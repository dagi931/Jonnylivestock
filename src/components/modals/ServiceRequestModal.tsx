import React, { useState } from 'react';
import { Animal } from '../../types/animal';
import { business } from '../../config/business';
import { formatPrice } from '../../utils/formatters';
import { ServiceSelector } from '../services/ServiceSelector';
import { livestockServices, ethiopianMealPurposes } from '../../data/services';
import {
  X,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  Scale,
  Utensils
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface ServiceRequestModalProps {
  animal?: Animal;
  preSelectedServices?: string[];
  isOpen: boolean;
  onClose: () => void;
}

export const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({
  animal,
  preSelectedServices = [],
  isOpen,
  onClose
}) => {
  const { theme } = useTheme();
  const { isAmharic } = useLanguage();
  const isDark = theme === 'design7';

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>(preSelectedServices);
  const [meatAnimal, setMeatAnimal] = useState<'sheep' | 'goat' | 'cow' | 'mixed'>('cow');
  const [selectedMealPurposes, setSelectedMealPurposes] = useState<string[]>(['wot', 'kitfo']);
  const [meatKg, setMeatKg] = useState('10');
  const [sheepKg, setSheepKg] = useState('5');
  const [goatKg, setGoatKg] = useState('5');
  const [cowKg, setCowKg] = useState('10');
  const [establishmentType, setEstablishmentType] = useState('hotel_restaurant');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const isMeatByKgSelected = selectedServices.includes('meat-by-kg');
  const isFreshSheepSelected = selectedServices.includes('fresh-slaughtered-sheep');

  const totalMixedKg =
    (parseFloat(sheepKg) || 0) + (parseFloat(goatKg) || 0) + (parseFloat(cowKg) || 0);

  const getMeatOrderSummary = () => {
    if (meatAnimal === 'mixed') {
      return `Mixed Order: ${totalMixedKg} KG (Sheep: ${sheepKg || 0}kg, Goat: ${goatKg || 0}kg, Cow: ${cowKg || 0}kg)`;
    }
    return `${meatKg} KG of ${meatAnimal.toUpperCase()} meat`;
  };

  const toggleMealPurpose = (id: string) => {
    if (selectedMealPurposes.includes(id)) {
      setSelectedMealPurposes(selectedMealPurposes.filter((p) => p !== id));
    } else {
      setSelectedMealPurposes([...selectedMealPurposes, id]);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!customerName.trim()) {
      newErrors.name = isAmharic ? 'እባክዎ ሙሉ ስም ወይም የድርጅት ስም ያስገቡ' : 'Full name or business name is required';
    }
    if (!phoneNumber.trim()) {
      newErrors.phone = isAmharic ? 'እባክዎ ስልክ ቁጥር ያስገቡ' : 'Phone number is required';
    } else if (!/^[+0-9\s-]{9,15}$/.test(phoneNumber.trim())) {
      newErrors.phone = isAmharic ? 'እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ' : 'Please enter a valid phone number';
    }
    if ((selectedServices.includes('delivery') || isFreshSheepSelected || isMeatByKgSelected) && !location.trim()) {
      newErrors.location = isAmharic ? 'ለማድረስ የመድረሻ አድራሻ ወይም የወጥ ቤት ቦታ ያስፈልጋል' : 'Destination address/kitchen location is required for delivery';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 500);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    onClose();
  };

  const getServiceTitles = () => {
    return selectedServices
      .map((id) => livestockServices.find((s) => s.id === id)?.title)
      .filter(Boolean)
      .join(', ');
  };

  const getSelectedMealPurposeLabels = () => {
    return selectedMealPurposes
      .map((id) => {
        const found = ethiopianMealPurposes.find((p) => p.id === id);
        return found ? `${found.amharicName} (${found.name})` : id;
      })
      .join(', ');
  };

  const generateWhatsAppMessage = () => {
    const serviceList = getServiceTitles() || 'General Services';
    const animalContext = animal ? `for ${animal.breed} (${animal.id})` : '';
    const mealPurposesStr = getSelectedMealPurposeLabels();
    const meatDetails = isMeatByKgSelected
      ? ` | Meat Order: [${getMeatOrderSummary()} | For: ${mealPurposesStr || 'General'} | Buyer: ${establishmentType}]`
      : '';
    const sheepDetails = isFreshSheepSelected
      ? ` | Freshly Slaughtered Sheep Delivery requested`
      : '';

    return `Hello ${business.name}, I would like to request services ${animalContext}. Services: [${serviceList}]${meatDetails}${sheepDetails}. Customer: ${customerName} (Phone: ${phoneNumber}). ${location ? `Destination: ${location}.` : ''} Note: ${message || 'Please contact me to confirm pricing and delivery schedule.'}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-3 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div className="min-h-full flex items-center justify-center py-4 sm:py-6">
        <div className="fixed inset-0" onClick={handleResetAndClose} aria-hidden="true" />
        <div
          className={`relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-xl p-6 sm:p-7 z-10 ${
            isDark
              ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#F4E8D0]'
              : 'bg-[#F1E8D8] border-[#E4D4BC] text-[#2A1A0D]'
          }`}
        >
        <button
          onClick={handleResetAndClose}
          type="button"
          className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${
            isDark ? 'hover:bg-[#1B1208] text-[#D8C5A8]' : 'hover:bg-[#F1E8D8] text-[#746556]'
          }`}
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="font-serif font-bold text-2xl">
              {isAmharic ? 'የአገልግሎት ጥያቄ ተልኳል' : 'Service Request Submitted'}
            </h3>

            <p className="text-sm leading-relaxed max-w-md mx-auto opacity-90">
              {isAmharic
                ? `እናመሰግናለን ${customerName}! ለ ${getServiceTitles() || 'የእርሻ አገልግሎቶች'} ያቀረቡት ጥያቄ በ ${business.name} ተቀብለናል።`
                : `Thank you, ${customerName}! Your request for ${getServiceTitles() || 'Livestock Services'} has been received by ${business.name}.`}
            </p>

            {isMeatByKgSelected && (
              <div
                className={`p-3.5 rounded-xl border text-xs text-left space-y-1 ${
                  isDark ? 'bg-[#1B1208] border-[#C58A3A]/40' : 'bg-[#FAF7F0] border-[#B8792F]/40'
                }`}
              >
                <div className="font-bold text-amber-500 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  <span>{isAmharic ? 'የስጋ በኪሎ ዝርዝር መረጃ፡' : 'Meat in KG Specifications:'}</span>
                </div>
                <div><strong>{isAmharic ? 'ትዕዛዝ' : 'Order'}:</strong> {getMeatOrderSummary()}</div>
                <div><strong>{isAmharic ? 'ለምግብ ዓይነት' : 'Meal Purpose'}:</strong> {getSelectedMealPurposeLabels() || (isAmharic ? 'ጠቅላላ' : 'General')}</div>
              </div>
            )}

            <div
              className={`p-4 rounded-2xl border text-left text-xs space-y-2 ${
                isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
              }`}
            >
              <div className="flex items-start gap-2 font-semibold text-amber-500">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{isAmharic ? 'ማሳሰቢያ፡ ቀጥታ ከባለቤቱ የሚደረግ ማረጋገጫ' : 'Notice: Direct Seller Confirmation'}</span>
              </div>
              <p className="opacity-80">
                {isAmharic
                  ? `ባለቤቱ መጠኑን፣ ዋጋውንና የማድረሻ ሰዓቱን ለማረጋገጥ በ ${phoneNumber} በቀጥታ ይደውሉልዎታል።`
                  : `The seller will contact you directly at ${phoneNumber} to confirm your quantities (KG/cuts), pricing, and delivery schedule from Arat Kilo, Addis Ababa.`}
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(generateWhatsAppMessage())}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-transform active:scale-[0.98] ${
                  isDark
                    ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]'
                    : 'bg-[#B8792F] hover:bg-[#9E6523] text-[#FAF7F0]'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>{isAmharic ? 'በዋትስአፕ አረጋግጥ' : 'Confirm on WhatsApp'}</span>
              </a>

              <button
                type="button"
                onClick={handleResetAndClose}
                className={`py-3 px-6 rounded-xl text-sm font-semibold border transition-colors ${
                  isDark
                    ? 'bg-[#1B1208] border-[#4A2C16] text-[#D8C5A8] hover:text-[#F4E8D0]'
                    : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#746556] hover:text-[#2A1A0D]'
                }`}
              >
                {isAmharic ? 'ተጠናቋል' : 'Done'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-500 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAmharic ? 'የእርሻና የንግድ አገልግሎቶች ዝግጅት' : 'Farm-to-Table & Commercial Service Arrangement'}</span>
              </div>
              <h2 className="font-serif font-bold text-2xl">
                {animal
                  ? (isAmharic ? `ለ ${animal.breed} አገልግሎት ይጠይቁ` : `Request Services for ${animal.breed}`)
                  : (isAmharic ? 'የእርሻና የስጋ አገልግሎት ጥያቄ' : 'Request Farm & Meat Services')}
              </h2>
              {animal && (
                <div className="mt-2 flex items-center gap-2 text-xs opacity-80">
                  <span className="font-mono font-semibold bg-black/20 px-2 py-0.5 rounded">
                    ID: {animal.id}
                  </span>
                  <span>•</span>
                  <span>{isAmharic ? 'ዋጋ' : 'Price'}: {formatPrice(animal.price)}</span>
                  <span>•</span>
                  <span>{isAmharic ? 'ቦታ' : 'Location'}: {animal.location}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Select Desired Services */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-90">
                  {isAmharic ? 'የሚፈልጉትን አገልግሎት ይምረጡ' : 'Select Services You Need'}
                </label>
                <ServiceSelector
                  selectedServices={selectedServices}
                  onChange={setSelectedServices}
                />
              </div>

              {/* Special Options if Meat by KG is Selected */}
              {isMeatByKgSelected && (
                <div
                  className={`p-4 rounded-2xl border space-y-3.5 animate-in fade-in-50 duration-200 ${
                    isDark ? 'bg-[#1B1208] border-[#C58A3A]/40' : 'bg-[#FAF7F0] border-[#B8792F]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase tracking-wider">
                      <Scale className="w-4 h-4" />
                      <span>{isAmharic ? 'የስጋ በኪሎ ምርጫ' : 'Meat in KG Customization'}</span>
                    </div>
                    <span className="text-[10px] opacity-70">{isAmharic ? 'ለሆቴሎችና ሬስቶራንቶች' : 'Hotels, Restaurants & Bulk'}</span>
                  </div>

                  {/* 1. Animal Source Selector: Sheep, Goat, Cow */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 opacity-90">
                      {isAmharic ? '1. የእንስሳ ዓይነት ይምረጡ፡' : '1. Select Animal Source:'}
                    </label>
                    <div className="grid grid-cols-4 gap-1.5 text-xs">
                      {[
                        { id: 'sheep', label: isAmharic ? 'በግ' : 'Sheep (በግ)' },
                        { id: 'goat', label: isAmharic ? 'ፍየል' : 'Goat (ፍየል)' },
                        { id: 'cow', label: isAmharic ? 'በሬ / ላም' : 'Cow (በሬ)' },
                        { id: 'mixed', label: isAmharic ? 'የተደባለቀ' : 'Mixed (የተደባለቀ)' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setMeatAnimal(item.id as any)}
                          className={`py-2 px-1.5 rounded-xl text-center font-semibold border transition-all text-[11px] ${
                            meatAnimal === item.id
                              ? isDark
                                ? 'bg-[#C58A3A] text-[#1B1208] border-[#C58A3A]'
                                : 'bg-[#B8792F] text-[#FAF7F0] border-[#B8792F]'
                              : isDark
                              ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#D8C5A8]'
                              : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#746556]'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Ethiopian Meal Purpose Selector */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 opacity-90 flex items-center justify-between">
                      <span>{isAmharic ? '2. የሥጋው ዓይነት ለምን ምግብ፡' : '2. Select Meal Purpose / የሥጋው ዓይነት ለምን ምግብ:'}</span>
                      <span className="text-[10px] opacity-60 font-normal">{isAmharic ? 'ሁሉንም መምረጥ ይችላሉ' : 'Select all that apply'}</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {ethiopianMealPurposes.map((meal) => {
                        const isChecked = selectedMealPurposes.includes(meal.id);
                        return (
                          <button
                            key={meal.id}
                            type="button"
                            onClick={() => toggleMealPurpose(meal.id)}
                            className={`p-2 rounded-xl text-left border transition-all flex items-start gap-1.5 ${
                              isChecked
                                ? isDark
                                  ? 'bg-[#4A2C16] border-[#C58A3A] text-[#F4E8D0] ring-1 ring-[#C58A3A]/40'
                                  : 'bg-[#F1E8D8] border-[#B8792F] text-[#2A1A0D] ring-1 ring-[#B8792F]/40'
                                : isDark
                                ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#D8C5A8]/70 hover:text-[#F4E8D0]'
                                : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#746556]/70 hover:text-[#2A1A0D]'
                            }`}
                          >
                            <Utensils className={`w-3 h-3 mt-0.5 shrink-0 ${isChecked ? 'text-amber-500' : 'opacity-40'}`} />
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate">
                                {meal.amharicName} ({meal.name})
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Quantity: Mixed vs Single */}
                  {meatAnimal === 'mixed' ? (
                    <div className="p-3 rounded-xl border space-y-2 bg-black/10">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-500">
                        <span>{isAmharic ? '3. ለእያንዳንዱ የስጋ ዓይነት ኪሎ ይግለጹ፡' : '3. Specify KG for Each Meat Type:'}</span>
                        <span>{isAmharic ? 'ድምር' : 'Total'}: {totalMixedKg} KG</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold mb-0.5">{isAmharic ? 'በግ' : 'Sheep (በግ)'}</label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={sheepKg}
                            onChange={(e) => setSheepKg(e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg text-xs font-bold border"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold mb-0.5">{isAmharic ? 'ፍየል' : 'Goat (ፍየል)'}</label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={goatKg}
                            onChange={(e) => setGoatKg(e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg text-xs font-bold border"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold mb-0.5">{isAmharic ? 'በሬ' : 'Cow (በሬ)'}</label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={cowKg}
                            onChange={(e) => setCowKg(e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg text-xs font-bold border"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-semibold mb-1 opacity-90">
                          {isAmharic ? '3. ግምታዊ መጠን በኪሎግራም (KG)' : '3. Estimated Quantity in Kilograms (KG)'}
                        </label>
                        <input
                          type="text"
                          placeholder={isAmharic ? 'ለምሳሌ፡ 20 ኪሎ ወይም 100 ኪሎ' : 'e.g. 20 kg or 100 kg'}
                          value={meatKg}
                          onChange={(e) => setMeatKg(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl text-sm border focus:outline-none ${
                            isDark
                              ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#F4E8D0]'
                              : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1 opacity-90">
                          {isAmharic ? '4. ለማን ነው የሚታዘዘው፡' : '4. Ordering For:'}
                        </label>
                        <select
                          value={establishmentType}
                          onChange={(e) => setEstablishmentType(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl text-sm border focus:outline-none ${
                            isDark
                              ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#F4E8D0]'
                              : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                          }`}
                        >
                          <option value="hotel_restaurant">{isAmharic ? 'ሆቴል / ባህላዊ ሬስቶራንት' : 'Hotel / Traditional Restaurant'}</option>
                          <option value="catering">{isAmharic ? 'ኬተሪንግና የዝግጅት ኩሽና' : 'Catering & Events Kitchen'}</option>
                          <option value="household">{isAmharic ? 'የቤተሰብ / የቤት ውስጥ ፍጆታ' : 'Household / Family Bulk'}</option>
                          <option value="ceremony">{isAmharic ? 'ለበዓል / ለሰርግ ግብዣ' : 'Ceremony / Banquet Feast'}</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {meatAnimal === 'mixed' && (
                    <div>
                      <label className="block text-xs font-semibold mb-1 opacity-90">
                        {isAmharic ? '4. ለማን ነው የሚታዘዘው፡' : '4. Ordering For:'}
                      </label>
                      <select
                        value={establishmentType}
                        onChange={(e) => setEstablishmentType(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl text-sm border focus:outline-none ${
                          isDark
                            ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#F4E8D0]'
                            : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                        }`}
                      >
                        <option value="hotel_restaurant">{isAmharic ? 'ሆቴል / ባህላዊ ሬስቶራንት' : 'Hotel / Traditional Restaurant'}</option>
                        <option value="catering">{isAmharic ? 'ኬተሪንግና የዝግጅት ኩሽና' : 'Catering & Events Kitchen'}</option>
                        <option value="household">{isAmharic ? 'የቤተሰብ / የቤት ውስጥ ፍጆታ' : 'Household / Family Bulk'}</option>
                        <option value="ceremony">{isAmharic ? 'ለበዓል / ለሰርግ ግብዣ' : 'Ceremony / Banquet Feast'}</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    {isAmharic ? 'ሙሉ ስምዎ / የድርጅት ስም' : 'Your Name / Establishment'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={isAmharic ? 'ለምሳሌ፡ ዳዊት (ቦሌ ሆቴል)' : 'e.g. Dawit (Bole Hotel Kitchen)'}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${
                      errors.name ? 'border-red-500 ring-1 ring-red-500' : ''
                    } ${
                      isDark
                        ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] focus:ring-[#C58A3A]'
                        : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D] focus:ring-[#B8792F]'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                    {isAmharic ? 'ስልክ ቁጥር' : 'Phone Number'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder={isAmharic ? 'ለምሳሌ፡ +251 91 123 4567' : 'e.g. +251 91 123 4567'}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${
                      errors.phone ? 'border-red-500 ring-1 ring-red-500' : ''
                    } ${
                      isDark
                        ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] focus:ring-[#C58A3A]'
                        : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D] focus:ring-[#B8792F]'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery Location */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                  {isAmharic ? 'የማድረሻ አድራሻ / የወጥ ቤት ቦታ' : 'Destination Address / Kitchen Location'}
                  <span className="text-red-500"> *</span>
                </label>
                <input
                  type="text"
                  placeholder={isAmharic ? 'ለምሳሌ፡ አዲስ አበባ፣ ቦሌ ወይም አራት ኪሎ' : 'e.g. Addis Ababa, Bole near Medhanialem or Arat Kilo'}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${
                    errors.location ? 'border-red-500 ring-1 ring-red-500' : ''
                  } ${
                    isDark
                      ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] focus:ring-[#C58A3A]'
                      : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D] focus:ring-[#B8792F]'
                  }`}
                />
                {errors.location && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.location}
                  </p>
                )}
              </div>

              {/* Additional Message */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                  {isAmharic ? 'የስጋ አቆራረጥ ፍላጎትና ልዩ መመሪያ' : 'Cut Requirements & Special Instructions'}
                </label>
                <textarea
                  rows={2}
                  placeholder={isAmharic ? 'ለምሳሌ፡ ለጥብስ የተከተፈ፣ የጎድን ስጋ፣ የየዕለት አቅርቦት...' : 'e.g. Specific Tibs cuts, rib portions, regular daily hotel delivery, weekend delivery...'}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border focus:outline-none resize-none ${
                    isDark
                      ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]'
                      : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                  }`}
                />
              </div>

              {/* Notice */}
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  isDark ? 'bg-[#1B1208]/70 border-[#4A2C16] text-[#D8C5A8]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#746556]'
                }`}
              >
                <strong>{isAmharic ? 'ቀጥታ ከባለቤቱ የሚደረግ ማረጋገጫ፡' : 'Direct Seller Coordination:'}</strong> {isAmharic ? 'የስጋው ኪሎ ክብደት፣ የጅምላ ዋጋና የማድረሻ ሰዓት ከባለቤቱ ጋር በቀጥታ ይረጋገጣል።' : 'All kg weights, wholesale rates for hotels, and fresh delivery timings are confirmed directly by the seller upon review.'}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 ${
                    isDark
                      ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]'
                      : 'bg-[#B8792F] hover:bg-[#9E6523] text-[#FAF7F0]'
                  } disabled:opacity-50`}
                >
                  {isSubmitting ? (isAmharic ? 'ጥያቄው እየተላከ ነው...' : 'Submitting Request...') : (isAmharic ? 'የአገልግሎት ጥያቄ ላክ' : 'Submit Service Request')}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className={`py-2.5 px-4 rounded-lg text-sm font-semibold border transition-colors ${
                    isDark
                      ? 'bg-[#1B1208] border-[#4A2C16] text-[#D8C5A8] hover:text-[#F4E8D0]'
                      : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#746556] hover:text-[#2A1A0D]'
                  }`}
                >
                  {isAmharic ? 'ሰርዝ' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  </div>
);
};
