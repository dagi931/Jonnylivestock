import React from 'react';
import { Link } from 'react-router-dom';
import { business } from '../../config/business';
import { Phone, MessageCircle, MapPin, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import { getPhoneCallLink, getWhatsAppLink } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { theme } = useTheme();
  const { t, isAmharic } = useLanguage();
  const isDark = theme === 'design7';

  return (
    <footer
      className={`border-t transition-colors duration-200 ${
        isDark
          ? 'bg-[#1B1208] text-[#D8C5A8] border-[#4A2C16]'
          : 'bg-[#2A1A0D] text-[#D8C5A8] border-[#4A2C16]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 sm:pt-10 sm:pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 lg:gap-8">
          
          {/* Col 1: Business Overview */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Jonny Livestock"
                width="44"
                height="36"
                className="h-8 sm:h-9 w-auto object-contain shrink-0 drop-shadow-sm"
              />
              <span className="font-serif font-bold text-lg text-[#F4E8D0]">
                {business.name}
              </span>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-[#D8C5A8]/90">
              {isAmharic
                ? 'በአዋሬ አዲስ አበባ የሚገኝ የቀንድ ከብቶች፣ በጎችና ፍየሎች አቅራቢ እንዲሁም ለሆቴሎችና ሬስቶራንቶች የስጋ አቅርቦት ድርጅት።'
                : business.description}
            </p>

            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#2A1A0D] border border-[#4A2C16] text-xs text-[#E0B15A]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C58A3A]" />
              <span>{t.footer.singleOwnerBadge}</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="font-serif font-bold text-xs text-[#F4E8D0] mb-3 tracking-wider uppercase">
              {t.footer.quickNavTitle}
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              {[
                { name: t.common.browseSheep, path: '/sheep' },
                { name: t.common.browseGoats, path: '/goats' },
                { name: t.common.browseCows, path: '/cows' },
                { name: t.common.browseMeat, path: '/#meat-by-kg' },
                { name: isAmharic ? 'የስጋና የከብት አገልግሎቶች' : 'Livestock & Meat Services', path: '/services' },
                { name: isAmharic ? 'ስለ እኛ' : 'About Jonny Livestock', path: '/about' },
                { name: isAmharic ? 'ያግኙንና አድራሻ' : 'Contact & Location', path: '/contact' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="group inline-flex items-center gap-1.5 hover:text-[#E0B15A] transition-colors"
                  >
                    <ChevronRight className="w-3 h-3 text-[#C58A3A] transition-transform group-hover:translate-x-0.5" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Direct Contact */}
          <div>
            <h3 className="font-serif font-bold text-xs text-[#F4E8D0] mb-3 tracking-wider uppercase">
              {t.footer.directContactTitle}
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a
                  href={getPhoneCallLink(business.phone)}
                  className="flex items-start gap-2.5 group hover:text-[#E0B15A] transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#C58A3A] mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-[#D8C5A8]/60 uppercase font-semibold">{isAmharic ? 'የቀጥታ ስልክ' : 'Direct Phone'}</span>
                    <span className="font-medium">{business.displayPhone}</span>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href={getWhatsAppLink(business.whatsapp, isAmharic ? 'ሰላም፣ ስላላችሁ ከብቶችና አገልግሎቶች ማወቅ ፈልጌ ነበር።' : 'Hello, I am inquiring about available livestock and services.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 group hover:text-[#E0B15A] transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#C58A3A] mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-[#D8C5A8]/60 uppercase font-semibold">{isAmharic ? 'የዋትስአፕ መልእክት' : 'WhatsApp Inquiry'}</span>
                    <span className="font-medium">{business.displayWhatsapp}</span>
                  </div>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C58A3A] mt-0.5 shrink-0" />
                <div>
                  <span className="block text-[10px] text-[#D8C5A8]/60 uppercase font-semibold">{isAmharic ? 'የማዕከሉ አድራሻ' : 'Facility Location'}</span>
                  <span>{business.location}</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 4: Business Hours & Visiting */}
          <div>
            <h3 className="font-serif font-bold text-xs text-[#F4E8D0] mb-3 tracking-wider uppercase">
              {t.footer.visitingTitle}
            </h3>
            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#C58A3A] mt-0.5 shrink-0" />
                <div>
                  <span className="block text-[10px] text-[#D8C5A8]/60 uppercase font-semibold">{isAmharic ? 'የስራ ሰዓታት' : 'Operating Hours'}</span>
                  <span className="text-xs leading-snug">{business.businessHours}</span>
                </div>
              </div>
              <p className="text-xs text-[#D8C5A8]/70 bg-[#2A1A0D]/70 p-2.5 rounded-lg border border-[#4A2C16]">
                {t.footer.visitingNote}
              </p>
            </div>
          </div>

        </div>

        {/* Compact Bottom Bar */}
        <div className="mt-5 pt-3 border-t border-[#4A2C16]/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#D8C5A8]/75">
          <p>© {new Date().getFullYear()} {business.name}. {t.footer.allRightsReserved}</p>
          <p className="flex items-center gap-2">
            <span>{isAmharic ? 'በጎች · ፍየሎች · ከብቶች' : 'Sheep · Goats · Cows'}</span>
            <span>•</span>
            <span>{t.footer.tagline}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
