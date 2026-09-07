import React, { useState } from 'react';
import { Animal } from '../../types/animal';
import { ReservationFormData } from '../../types/animal';
import { business } from '../../config/business';
import { formatPrice } from '../../utils/formatters';
import { X, CheckCircle2, AlertCircle, MessageSquare, ShieldAlert } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface ReservationModalProps {
  animal: Animal;
  isOpen: boolean;
  onClose: () => void;
  onOpenDepositSlip?: () => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  animal,
  isOpen,
  onClose,
  onOpenDepositSlip
}) => {
  const { theme } = useTheme();
  const { isAmharic } = useLanguage();
  const isDark = theme === 'design7';

  const defaultMsg = isAmharic
    ? `ሰላም፣ ስለ ${animal.breed} (${animal.id}) ለመያዝ እፈልጋለሁ። እባክዎ መመልከቻ ወይም መረከቢያ ዝርዝሩን ያሳውቁኝ።`
    : `Hello, I would like to request a reservation for ${animal.breed} (${animal.id}). Please let me know the pickup or viewing details.`;

  const [formData, setFormData] = useState<ReservationFormData>({
    animalId: animal.id,
    animalBreed: animal.breed,
    animalPrice: animal.price,
    name: '',
    phone: '',
    message: defaultMsg
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = isAmharic ? 'እባክዎ ሙሉ ስምዎን ያስገቡ' : 'Full name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = isAmharic ? 'እባክዎ ስልክ ቁጥርዎን ያስገቡ' : 'Phone number is required';
    } else if (!/^[+0-9\s-]{9,15}$/.test(formData.phone.trim())) {
      newErrors.phone = isAmharic ? 'እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ' : 'Please enter a valid phone number';
    }
    if (!formData.message.trim()) {
      newErrors.message = isAmharic ? 'እባክዎ መልእክትዎን ያስገቡ' : 'Please provide a message or pickup note';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate frontend submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-3 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div className="min-h-full flex items-center justify-center py-4 sm:py-6">
        <div className="fixed inset-0" onClick={handleResetAndClose} aria-hidden="true" />
        <div
          className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border shadow-xl p-6 sm:p-7 z-10 ${
            isDark
              ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#F4E8D0]'
              : 'bg-[#F1E8D8] border-[#E4D4BC] text-[#2A1A0D]'
          }`}
        >
        {/* Close Button */}
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
          /* Success State */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="font-serif font-bold text-2xl">
              {isAmharic ? 'የእንስሳ መያዣ ጥያቄ ተልኳል' : 'Reservation Request Submitted'}
            </h3>

            <p className="text-sm leading-relaxed max-w-md mx-auto opacity-90">
              {isAmharic
                ? `እናመሰግናለን ${formData.name}! ለ ${animal.breed} (${animal.id}) ያቀረቡት ጥያቄ ተመዝግቧል።`
                : `Thank you, ${formData.name}! Your reservation request for ${animal.breed} (${animal.id}) has been recorded.`}
            </p>

            <div
              className={`p-4 rounded-2xl border text-left text-xs space-y-2 ${
                isDark ? 'bg-[#1B1208] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
              }`}
            >
              <div className="flex items-start gap-2 font-semibold text-amber-500">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{isAmharic ? 'ማሳሰቢያ፡ ቀጥታ ከባለቤቱ ጋር የሚደረግ ስምምነት (የኦንላይን ክፍያ አያስፈልግም)' : 'Notice: Direct Seller Agreement (No Online Payment)'}</span>
              </div>
              <p className="opacity-80">
                {isAmharic
                  ? `ይህ ድረ-ገጽ የኦንላይን ክፍያ አይጠይቅም። ባለቤቱ (${business.name}) የእንስሳውን ዝግጁነት ለማረጋገጥ እና መረከቢያውን ለማመቻቸት በ ${formData.phone} ይደውሉልዎታል።`
                  : `This website does not process online payments. The seller (${business.name}) will call or message you shortly at ${formData.phone} to confirm animal availability, arrange viewing, and finalize pickup/delivery.`}
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
                  isAmharic
                    ? `ሰላም ${business.name}፣ አሁን ለ ${animal.breed} (${animal.id}) የመያዣ ጥያቄ ልኬ ነበር። ስሜ ${formData.name} ነው።`
                    : `Hello ${business.name}, I just submitted a reservation request for ${animal.breed} (${animal.id}). My name is ${formData.name}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-transform active:scale-[0.98] ${
                  isDark
                    ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]'
                    : 'bg-[#B8792F] hover:bg-[#9E6523] text-[#FAF7F0]'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>{isAmharic ? 'በዋትስአፕ መልእክት ላክ' : 'Send WhatsApp Follow-up'}</span>
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
          /* Form State */
          <div>
            <div className="mb-6">
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
                }`}
              >
                {isAmharic ? 'እንስሳ መያዣ ጥያቄ' : 'Request Animal Hold'}
              </span>
              <h2 className="font-serif font-bold text-2xl mt-1">
                {isAmharic ? `${animal.breed} መያዝ` : `Reserve ${animal.breed}`}
              </h2>
              <div className="mt-2 flex items-center gap-3 text-xs opacity-80">
                <span className="font-mono font-semibold bg-black/20 px-2 py-0.5 rounded">
                  ID: {animal.id}
                </span>
                <span>•</span>
                <span>{isAmharic ? 'ዋጋ' : 'Price'}: {formatPrice(animal.price)}</span>
                <span>•</span>
                <span>{isAmharic ? 'ቦታ' : 'Location'}: {animal.location}</span>
              </div>
            </div>

            {/* 50% Reservation Deposit Guarantee Callout */}
            <div
              className={`p-3.5 rounded-2xl border mb-4 flex items-center justify-between gap-3 ${
                isDark ? 'bg-[#1B1208] border-amber-500/40' : 'bg-[#FAF7F0] border-amber-500/40'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{isAmharic ? '50% ቅድመ-ክፍያ በማስያዝ እንስሳውን አሁኑኑ ያስይዙ' : 'Lock & Reserve with 50% Deposit'}</span>
                </div>
                <div className="text-xs opacity-75 mt-0.5">
                  {isAmharic
                    ? `እንስሳው ለሌላ እንዳይሸጥ 50% (${formatPrice(animal.price * 0.5)}) በመክፈል ማስያዝ ይችላሉ።`
                    : `Pay 50% (${formatPrice(animal.price * 0.5)}) now to immediately lock this animal.`}
                </div>
              </div>
              {onOpenDepositSlip && (
                <button
                  type="button"
                  onClick={() => {
                    handleResetAndClose();
                    onOpenDepositSlip();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold shrink-0 transition-all shadow cursor-pointer"
                >
                  {isAmharic ? '50% ክፈል' : 'Pay 50%'}
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-90">
                  {isAmharic ? 'ሙሉ ስምዎ' : 'Your Full Name'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={isAmharic ? 'ለምሳሌ፡ ዳዊት ታደሰ' : 'e.g. Dawit Tadesse'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${
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

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-90">
                  {isAmharic ? 'ስልክ ቁጥር' : 'Phone Number'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder={isAmharic ? 'ለምሳሌ፡ +251 91 123 4567' : 'e.g. +251 91 123 4567'}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${
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

              {/* Message / Pickup preferences */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-90">
                  {isAmharic ? 'መልእክት / የመረከቢያ ማስታወሻ' : 'Message / Pickup Notes'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all resize-none ${
                    errors.message ? 'border-red-500 ring-1 ring-red-500' : ''
                  } ${
                    isDark
                      ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] focus:ring-[#C58A3A]'
                      : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D] focus:ring-[#B8792F]'
                  }`}
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Disclaimer */}
              <div
                className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                  isDark ? 'bg-[#1B1208]/70 border-[#4A2C16] text-[#D8C5A8]' : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#746556]'
                }`}
              >
                <strong className="block text-[11px] uppercase tracking-wide mb-0.5">
                  {isAmharic ? 'የቀጥታ ስምምነት' : 'Direct Arrangement'}
                </strong>
                {isAmharic
                  ? 'ምንም ዓይነት የኦንላይን ክፍያ አይጠየቅም። ይህንን ቅጽ መሙላት ለባለቤቱ ፍላጎትዎን ለማሳወቅ ነው።'
                  : 'No payment is taken online. Submitting this form informs the seller of your intent to reserve this animal for direct purchase.'}
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
                  {isSubmitting ? (
                    <span>{isAmharic ? 'ጥያቄው እየተላከ ነው...' : 'Submitting Request...'}</span>
                  ) : (
                    <span>{isAmharic ? 'የመያዣ ጥያቄ ላክ' : 'Submit Reservation Request'}</span>
                  )}
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
