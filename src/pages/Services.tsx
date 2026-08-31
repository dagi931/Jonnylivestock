import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { livestockServices, serviceFlowSteps } from '../data/services';
import { business } from '../config/business';
import {
  Truck,
  UtensilsCrossed,
  PartyPopper,
  Scale,
  Sparkles,
  Check,
  PhoneCall,
  MessageSquare,
  ArrowRight,
  UserCheck,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { getPhoneCallLink, getWhatsAppLink } from '../utils/formatters';

export const Services: React.FC = () => {
  const { theme } = useTheme();
  const { t, isAmharic } = useLanguage();
  const isDark = theme === 'design7';

  const iconMap: Record<string, React.ElementType> = {
    Truck,
    UtensilsCrossed,
    PartyPopper,
    Scale,
    Sparkles
  };

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Intro */}
        <div className="max-w-2xl mb-10">
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${
              isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
            }`}
          >
            {t.servicesPage.badge}
          </span>
          <h1
            className={`font-serif font-bold text-2xl sm:text-3xl lg:text-4xl mt-1.5 mb-3 ${
              isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
            }`}
          >
            {t.servicesPage.title}
          </h1>
          <p
            className={`text-xs sm:text-sm leading-relaxed ${
              isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'
            }`}
          >
            {t.servicesPage.subtext}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/services/meat-by-kg"
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs inline-flex items-center gap-1.5 ${
                isDark
                  ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]'
                  : 'bg-[#B8792F] hover:bg-[#9E6523] text-[#FAF7F0]'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{t.servicesPage.orderMeatByKg}</span>
            </Link>

            <Link
              to="/services/delivery"
              className={`px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm border transition-colors ${
                isDark
                  ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#F4E8D0] hover:border-[#C58A3A]'
                  : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#241A12] hover:border-[#B8792F]'
              }`}
            >
              <span>{t.servicesPage.bookLiveDelivery}</span>
            </Link>

            <a
              href={getWhatsAppLink(business.whatsapp, isAmharic ? 'ሰላም ጆኒ፣ ስለ እርሻ አገልግሎቶቻችሁ መጠየቅ ፈልጌ ነበር።' : 'Hello Jonny Livestock, I would like to inquire about your farm services.')}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm border flex items-center gap-1.5 transition-colors ${
                isDark
                  ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] hover:border-[#C58A3A]'
                  : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#241A12] hover:border-[#B8792F]'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-green-500" />
              <span>{t.servicesPage.discussWhatsApp}</span>
            </a>
          </div>
        </div>

        {/* 5 Main Services - Clean Editorial Divided Layout */}
        <div className={`divide-y border-y mb-14 ${isDark ? 'divide-[#4A2C16] border-[#4A2C16]' : 'divide-[#E4D4BC] border-[#E4D4BC]'}`}>
          {livestockServices.map((service, index) => {
            const Icon = iconMap[service.iconName] || Truck;

            // Translated title & desc based on index/id
            let localizedTitle = service.title;
            let localizedDesc = service.fullDescription;
            let localizedBadge = '';

            if (service.id === 'delivery') {
              localizedTitle = isAmharic ? '01. የቀጥታ ከብት፣ በግና ፍየል ማጓጓዝ' : service.title;
              localizedBadge = isAmharic ? 'ከአዋሬ ቀጥታ የሚላክ' : 'Direct Dispatch from Aware';
            } else if (service.id === 'slaughter-prep') {
              localizedTitle = isAmharic ? '02. በቦታው ላይ የዕርድና የስጋ ዝግጅት' : service.title;
              localizedBadge = isAmharic ? '1 ባለሙያ ተመድቦ የሚሰራ' : '1 Dedicated Worker Assigned';
            } else if (service.id === 'events-ceremonies') {
              localizedTitle = isAmharic ? '03. ለበዓላት፣ ለሰርግና ለተለያዩ ዝግጅቶች' : service.title;
              localizedBadge = isAmharic ? 'ልዩ የዝግጅት አስተዳደር' : 'Custom Event Coordination';
            } else if (service.id === 'meat-by-kg') {
              localizedTitle = isAmharic ? '04. ስጋ በኪሎ ለሆቴሎች፣ ሬስቶራንቶችና ካፌዎች' : service.title;
              localizedBadge = isAmharic ? 'ለሆቴሎችና ሬስቶራንቶች' : 'Hotels, Restaurants & Catering';
            } else if (service.id === 'fresh-slaughtered-sheep') {
              localizedTitle = isAmharic ? '05. የታረደ ትኩስ በግ ማድረስ' : service.title;
              localizedBadge = isAmharic ? 'ከእርሻ በቀጥታ የታረደ' : 'Farm-Slaughtered Direct Delivery';
            }

            return (
              <div
                key={service.id}
                id={service.id}
                className="py-7 sm:py-9 first:pt-4 last:pb-4 transition-colors"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Number & Icon & Title */}
                  <div className="lg:col-span-4 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs font-mono font-bold tracking-widest ${isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'}`}>
                        0{index + 1}
                      </span>
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isDark
                            ? 'bg-[#2A1A0D] text-[#C58A3A]'
                            : 'bg-[#F1E8D8] text-[#B8792F]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <h2
                      className={`font-serif font-bold text-lg sm:text-xl ${
                        isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
                      }`}
                    >
                      {localizedTitle}
                    </h2>

                    <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-500 pt-1">
                      {service.id === 'meat-by-kg' ? (
                        <Building2 className="w-3.5 h-3.5 text-amber-500" />
                      ) : service.id === 'slaughter-prep' ? (
                        <UserCheck className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      <span>{localizedBadge}</span>
                    </div>
                  </div>

                  {/* Middle Column: Detailed Description & Highlights */}
                  <div className="lg:col-span-5 space-y-3">
                    <p
                      className={`text-xs sm:text-sm leading-relaxed ${
                        isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'
                      }`}
                    >
                      {localizedDesc}
                    </p>

                    {/* Highlights bullet list */}
                    <ul className="space-y-1.5 pt-1">
                      {service.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isDark ? 'bg-[#4A2C16] text-[#C58A3A]' : 'bg-[#E4D4BC] text-[#B8792F]'
                          }`}>
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                          <span className={isDark ? 'text-[#F4E8D0]/90' : 'text-[#241A12]/90'}>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right Column: Direct Dashboard Action Button */}
                  <div className="lg:col-span-3 lg:text-right flex flex-col justify-between self-stretch pt-2 lg:pt-0">
                    <div className="hidden lg:block text-xs opacity-60">
                      {isAmharic ? 'ቋሚ ተደራሽነት' : 'Standard Availability'}
                    </div>

                    <div>
                      <Link
                        to={`/services/${service.id}`}
                        className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-xs ${
                          isDark
                            ? 'bg-[#C58A3A] text-[#1B1208] hover:bg-[#E0B15A]'
                            : 'bg-[#B8792F] text-[#FAF7F0] hover:bg-[#9E6523]'
                        }`}
                      >
                        <span>{isAmharic ? 'ዝርዝሩን እይ' : service.ctaLabel}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* 6-Step Workflow - Continuous Linear Timeline */}
        <section className="mb-14">
          <div className="mb-6">
            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
              }`}
            >
              {t.servicesPage.workflowBadge}
            </span>
            <h2
              className={`font-serif font-bold text-xl sm:text-2xl mt-0.5 ${
                isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
              }`}
            >
              {t.servicesPage.workflowTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceFlowSteps.map((step) => (
              <div key={step.step} className="flex items-start gap-3.5 group">
                <span
                  className={`font-serif font-bold text-lg shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    isDark
                      ? 'bg-[#2A1A0D] text-[#C58A3A] border border-[#4A2C16]'
                      : 'bg-[#F1E8D8] text-[#B8792F] border border-[#E4D4BC]'
                  }`}
                >
                  {step.step}
                </span>

                <div className="space-y-0.5">
                  <h3 className={`font-serif font-bold text-sm ${isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'}`}>
                    {step.title}
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Strip: Hotel Wholesale & Ceremony Supply Consultation */}
        <div
          className={`p-6 sm:p-7 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isDark ? 'bg-[#2A1A0D] border-[#4A2C16]' : 'bg-[#F1E8D8] border-[#E4D4BC]'
          }`}
        >
          <div>
            <h3 className={`font-serif font-bold text-base sm:text-lg ${isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'}`}>
              {t.servicesPage.hotelConsultationTitle}
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'}`}>
              {t.servicesPage.hotelConsultationSubtext}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/services/meat-by-kg"
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-xs ${
                isDark
                  ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]'
                  : 'bg-[#B8792F] hover:bg-[#9E6523] text-[#FAF7F0]'
              }`}
            >
              {t.servicesPage.orderMeatByKg}
            </Link>

            <a
              href={getPhoneCallLink(business.phone)}
              className={`px-3.5 py-2 rounded-xl font-semibold text-xs border flex items-center gap-1.5 transition-colors ${
                isDark
                  ? 'bg-[#1B1208] border-[#4A2C16] text-[#F4E8D0] hover:text-[#E0B15A]'
                  : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#241A12] hover:text-[#B8792F]'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{t.cta.callPhone} {business.displayPhone}</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
