import React, { useState } from 'react';
import { Animal } from '../../types/animal';
import { business } from '../../config/business';
import { formatPrice } from '../../utils/formatters';
import { X, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface InquiryModalProps {
  animal: Animal;
  isOpen: boolean;
  onClose: () => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  animal,
  isOpen,
  onClose
}) => {
  const { theme } = useTheme();
  const { isAmharic } = useLanguage();
  const isDark = theme === 'design7';

  const defaultInquiry = isAmharic
    ? `ሰላም፣ ስለ ${animal.breed} (${animal.id}) በዋጋ ${formatPrice(animal.price)} መጠየቅ ፈልጌ ነበር። በ${animal.location} ለማየት ይገኛል?`
    : `Hello, I am interested in ${animal.breed} (${animal.id}) priced at ${formatPrice(animal.price)}. Is it still available for viewing in ${animal.location}?`;

  const [senderName, setSenderName] = useState('');
  const [inquiryText, setInquiryText] = useState(defaultInquiry);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const directWhatsAppUrl = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
    `${inquiryText} (From: ${senderName || 'Customer'})`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-8 my-8 animate-in fade-in zoom-in-95 duration-200 ${
          isDark
            ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#F4E8D0]'
            : 'bg-[#F1E8D8] border-[#E4D4BC] text-[#2A1A0D]'
        }`}
      >
        <button
          onClick={onClose}
          type="button"
          className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${
            isDark ? 'hover:bg-[#1B1208] text-[#D8C5A8]' : 'hover:bg-[#F1E8D8] text-[#746556]'
          }`}
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif font-bold text-xl">{isAmharic ? 'ጥያቄው ለባለቤቱ ተልኳል' : 'Inquiry Sent to Seller'}</h3>
            <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
              {isAmharic
                ? `እንዲሁም በቀጥታ በዋትስአፕ መቀጠል ወይም በ ${business.displayPhone} መደወል ይችላሉ።`
                : `You can also continue directly on WhatsApp or call the seller at ${business.displayPhone}.`}
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${
                  isDark
                    ? 'bg-[#C58A3A] text-[#1B1208] hover:bg-[#E0B15A]'
                    : 'bg-[#B8792F] text-[#FAF7F0] hover:bg-[#9E6523]'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>{isAmharic ? 'በዋትስአፕ ክፈት' : 'Open in WhatsApp'}</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold opacity-70 hover:opacity-100"
              >
                {isAmharic ? 'ዝጋ' : 'Close'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-5">
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
                }`}
              >
                {isAmharic ? 'የቀጥታ ጥያቄ' : 'Direct Inquiry'}
              </span>
              <h2 className="font-serif font-bold text-xl mt-1">
                {isAmharic ? `ስለ ${animal.breed} ይጠይቁ` : `Ask About ${animal.breed}`}
              </h2>
              <p className="text-xs opacity-70 mt-1">
                ID: <span className="font-mono font-semibold">{animal.id}</span> · {animal.location}
              </p>
            </div>

            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                  {isAmharic ? 'ስምዎ (አስገዳጅ ያልሆነ)' : 'Your Name (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={isAmharic ? 'ስምዎ' : 'Your Name'}
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none ${
                    isDark
                      ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]'
                      : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-90">
                  {isAmharic ? 'የጥያቄው መልእክት' : 'Inquiry Message'}
                </label>
                <textarea
                  rows={4}
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none resize-none ${
                    isDark
                      ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0]'
                      : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#2A1A0D]'
                  }`}
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-transform active:scale-[0.98] ${
                    isDark
                      ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]'
                      : 'bg-[#B8792F] hover:bg-[#9E6523] text-[#FAF7F0]'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isAmharic ? 'በዋትስአፕ ላክ' : 'Send via WhatsApp'}</span>
                </a>

                <a
                  href={`tel:${business.phone}`}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-colors ${
                    isDark
                      ? 'bg-[#1B1208] border-[#4A2C16] text-[#D8C5A8] hover:text-[#F4E8D0]'
                      : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#746556] hover:text-[#2A1A0D]'
                  }`}
                >
                  {isAmharic ? 'በስልክ ደውል' : 'Call by Phone'}
                </a>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
