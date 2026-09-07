import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useUserAuth } from '../context/UserAuthContext';
import { business } from '../config/business';
import { getWhatsAppLink, getPhoneCallLink } from '../utils/formatters';
import { livestockServices, serviceFlowSteps } from '../data/services';
import { MeatByKgOrderModal } from '../components/modals/MeatByKgOrderModal';
import {
  Truck,
  UtensilsCrossed,
  PartyPopper,
  Scale,
  Sparkles,
  Check,
  UserCheck,
  ShieldCheck,
  Building2,
  Gift,
  MessageSquare,
  PhoneCall
} from 'lucide-react';

export const Services: React.FC = () => {
  const { theme } = useTheme();
  const { t, isAmharic } = useLanguage();
  const { isAuthenticated, openAuthModal } = useUserAuth();
  const isDark = theme === 'design7';
  const [isMeatModalOpen, setIsMeatModalOpen] = useState(false);

  const iconMap: Record<string, React.ElementType> = {
    Truck,
    UtensilsCrossed,
    PartyPopper,
    Scale,
    Sparkles
  };

  const amharicServicesData: Record<
    string,
    {
      title: string;
      badge: string;
      desc: string;
      highlights: string[];
    }
  > = {
    delivery: {
      title: 'የቀጥታ ከብት፣ በግና ፍየል ማጓጓዝ',
      badge: 'ከአዋሬ ቀጥታ የሚላክ',
      desc: 'የገዟቸውን በጎች፣ ፍየሎች ወይም ሰንጋዎች በቀጥታ በአዲስ አበባ አዋሬ ከሚገኘው እርሻችን ወደ ቤትዎ፣ ዝግጅት ቦታዎ ወይም ድርጅትዎ በአስተማማኝና ምቹ ተሽከርካሪ እናደርሳለን። የእንስሳት አያያዝን የሚያውቁ ረዳቶች አብረው ይጓዛሉ።',
      highlights: [
        'በአዲስ አበባ አዋሬ ከሚገኘው እርሻችን ቀጥታ ማድረስ',
        'ለእንስሳት ምቹና ጥንቃቄ የተሞላበት አስተማማኝ ተሽከርካሪ',
        'በሰዓቱ መድረስና ደጃፍ ድረስ የማውረድ ድጋፍ',
        'የርቀት ርክክብ በተመጣጣኝ የትራንስፖርት ተመን'
      ]
    },
    'slaughter-prep': {
      title: 'በቦታው ላይ የዕርድና የስጋ ዝግጅት',
      badge: '1 ባለሙያ ተመድቦ የሚሰራ',
      desc: 'በደንበኛው ፍላጎት መሰረት አንድ ልምድ ያለው የሰለጠነ ባለሙያ ወደ ቦታዎ ድረስ በመላክ (ወይም በእርሻችን ቅጥር ግቢ) ንጹህና አስተማማኝ ዕርድ፣ ቆዳ መግፈፍ፣ ስጋ ማዘጋጀትና እንደፍላጎትዎ መቆራረጥ ያከናውናል።',
      highlights: [
        'አንድ ራሱን የቻለ ባለሙያ ለትዕዛዝዎ ይመደባል',
        'ከዕርድ ጀምሮ እስከ ስጋ ዝግጅት ሙሉውን ይሰራል',
        'ንጽህናው የተጠበቀና ባህላዊ ስርዓትን ያከበረ አሰራር',
        'ለማብሰል ወይም ለማስቀመጥ በሚያመች መንገድ መቆራረጥ'
      ]
    },
    'events-ceremonies': {
      title: 'ለበዓላት፣ ለሰርግና ለተለያዩ ዝግጅቶች',
      badge: 'ልዩ የዝግጅት አስተዳደር',
      desc: 'ለሃይማኖታዊ በዓላት (እንቁጣጣሽ፣ መስቀል፣ ገና፣ ፋሲካ፣ አረፋ፣ ኢድ)፣ ለሰርግ፣ ለሀዘንና ለተለያዩ ዝግጅቶች የሚሆኑ የተመረጡ ሰንጋዎች፣ በጎችና ፍየሎችን በብዛት እናቀርባለን። አስቀድሞ መያዝንና የባለሙያ እገዛን ያካትታል።',
      highlights: [
        'ለበዓላት፣ ለሰርግና ለተለያዩ ዝግጅቶች የተመቻቸ አቅርቦት',
        'የተመረጡ ወፍራም ሙክቶች፣ ፍየሎችና ሰንጋዎች ቅድሚያ ምርጫ',
        'በቀጥታ ወደ ዝግጅቱ ቦታ በሰዓቱ ማድረስ',
        'የሙሉ ዕርድና የስጋ ዝግጅት ባለሙያ ድጋፍ'
      ]
    },
    'meat-by-kg': {
      title: 'ስጋ በኪሎ ለሆቴሎች፣ ሬስቶራንቶችና ካፌዎች',
      badge: 'ለሆቴሎችና ሬስቶራንቶች',
      desc: 'ለሆቴሎች፣ ባህላዊ ሬስቶራንቶች፣ ካተሪንጎችና ለትላልቅ የቤተሰብ ድግሶች በንጽህና የተዘጋጀ ጥራት ያለው ስጋ በኪሎ እናቀርባለን። ከበግ፣ ፍየል ወይም ሰንጋ የተመረጠ ሆኖ ለወጥ፣ ክትፎ፣ ጥሬ ቁርጥ፣ ጥብስ፣ ዱለትና ጎድን የሚስማማ ተቆራርጦ ይቀርባል።',
      highlights: [
        'የእንስሳ ምርጫ፡ የበግ፣ የፍየል ወይም የበሬ ስጋ በኪሎ',
        'ለባህላዊ ምግቦች የተመቻቸ አቆራረጥ፡ ወጥ፣ ክትፎ፣ ጥሬ ቁርጥ፣ ጥብስ፣ ዱለት',
        'በዲጂታል ሚዛን በትክክል ተመዝኖ የሚዘጋጅ',
        'ለሆቴሎችና ሬስቶራንቶች የጅምላ ውል ስምምነት',
        'ንጽህናው ተጠብቆ በቀጥታ ወደ ማብሰያ ቤትዎ የሚደርስ'
      ]
    },
    'fresh-slaughtered-sheep': {
      title: 'የታረደ ትኩስ በግ ማድረስ',
      badge: 'ከእርሻ በቀጥታ የታረደ',
      desc: 'ቀጥታ በግ ገዝተው በቤትዎ ከማረድና ቆዳ ከመግፈፍ ጣጣ ነፃ ሆነው፣ በአዋሬው እርሻችን በንጽህና የታረደና የተዘጋጀ ሙሉ በግ ወይም ተቆራርጦ ወዲያውኑ ወደ ደጃፍዎ ይደርሳል።',
      highlights: [
        'ከመውጣቱ በፊት ወዲያውኑ በአዋሬ እርሻችን የታረደ',
        'ንጹህ ዕርድ፣ ቆዳ መግፈፍና እንደፍላጎትዎ መቆራረጥ',
        'ንጽህናው በተጠበቀ መንገድ በቀጥታ ወደ ደጃፍዎ ማድረስ',
        'የቤት ውስጥ ዕርድ ድካምና ቆሻሻን ያስቀረ'
      ]
    }
  };

  const amharicFlowSteps = [
    {
      title: 'እንስሳውን ወይም ስጋ በኪሎ ይምረጡ',
      description: 'የቀጥታ በግ፣ ፍየል፣ ሰንጋ፣ ወይም ስጋ በኪሎ ለፈለጉት የምግብ አይነት (ወጥ፣ ክትፎ፣ ጥሬ ቁርጥ፣ ጥብስ) ይምረጡ።'
    },
    {
      title: 'ዝርዝር መረጃና ግንኙነት',
      description: 'የሚፈልጉትን የኪሎ ግራም መጠን፣ የማድረሻ ቦታ ወይም የበዓል ቀን በስልክ ወይም በዋትስአፕ ይንገሩን።'
    },
    {
      title: 'በእርሻው ላይ የሚደረግ ዝግጅት',
      description: 'እንስሳቱ በሚዛን ይመዝናሉ ወይም በከፍተኛ ንጽህና ታርደውና ተዘጋጅተው በአዋሬ እርሻችን ይዘጋጃሉ።'
    },
    {
      title: 'ቀጥተኛ ማጓጓዝ',
      description: 'የቀጥታ እንስሳት፣ ሙሉ በግ ወይም የታሸጉ የስጋ ፓኬጆች በአስተማማኝ ተሽከርካሪ ወደ አድራሻዎ ይላካሉ።'
    },
    {
      title: 'የባለሙያ ረዳት ድጋፍ',
      description: 'በቦታው ላይ ለሚደረግ ዕርድ ባለሙያ ተልኮ በንጽህና ስጋውን ያዘጋጃል፤ ያከፋፍላል።'
    },
    {
      title: 'ለማብሰያ ቤትዎና ለማዕድ ዝግጁ',
      description: 'ትዕዛዝዎ ትኩስና ንጹህ ሆኖ ለቤትዎ፣ ለሆቴልዎ ወይም ለዝግጅትዎ ማዕድ ዝግጁ ሆኖ ይደርስዎታል።'
    }
  ];

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
              to="/packages"
              className="px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-black"
            >
              <Gift className="w-4 h-4" />
              <span>{isAmharic ? 'የበዓል ጥቅሎችና ቅርጫቶች' : 'Holiday Packages & Hampers'}</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsMeatModalOpen(true)}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer ${
                isDark
                  ? 'bg-[#C58A3A] hover:bg-[#E0B15A] text-[#1B1208]'
                  : 'bg-[#B8792F] hover:bg-[#9E6523] text-[#FAF7F0]'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{t.servicesPage.orderMeatByKg}</span>
            </button>

            <a
              href="#delivery"
              className={`px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm border transition-colors ${
                isDark
                  ? 'bg-[#2A1A0D] border-[#4A2C16] text-[#F4E8D0] hover:border-[#C58A3A]'
                  : 'bg-[#FAF7F0] border-[#E4D4BC] text-[#241A12] hover:border-[#B8792F]'
              }`}
            >
              <span>{t.servicesPage.bookLiveDelivery}</span>
            </a>
          </div>
        </div>

        {/* Featured Celebration Service - Clean Editorial Layout (Unboxed) */}
        <div className={`pt-10 pb-10 sm:pt-12 sm:pb-12 border-t ${isDark ? 'border-[#4A2C16]' : 'border-[#E4D4BC]'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-500">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isAmharic ? 'ልዩ የበዓልና የደስታ አገልግሎት' : 'Featured Celebration Service'}</span>
              </div>
              <h2 className="font-serif font-bold text-xl sm:text-3xl">
                {isAmharic ? 'የበዓል ድግስና የስጦታ ሙሉ ጥቅሎች' : 'Custom Celebration Hampers & Holiday Packages'}
              </h2>
              <p className="text-xs sm:text-sm opacity-80 leading-relaxed max-w-2xl">
                {isAmharic
                  ? 'የዶሮ፣ በግ፣ ፍየል፣ ሰንጋ ወይም ስጋ በኪሎ + ምርጥ የኢትዮጵያ ወይኖች ወይም የማር ጠጅ + ትኩስ የሀገር እንቁላል + የበዓል አበባዎችን በማቀናጀት የራስዎን ሙሉ የበዓል ጥቅል ያዘጋጁ። 100% ነፃ የማቀዝቀዣ ማድረሻና 50% የቅድመ-ክፍያ ማስያዣ ያካትታል!'
                  : 'Construct your own complete feast package combining Hen, Sheep, Goat, Ox or Meat in KG + Vintage Ethiopian Wines or Honey Tej + Fresh Farm Eggs + Celebration Flower Bouquets. Includes 100% Free Refrigerated Delivery and 50% Deposit Reservation!'}
              </p>

              {/* Benefit Badges with unified neutral style & consistent amber icons */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 text-xs">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.04] text-stone-700 dark:text-[#F4EAD9]">
                  <Truck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{isAmharic ? 'ነፃ ማድረሻ (ከ3+ ምድቦች)' : 'Free Delivery (3+ Categories)'}</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.04] text-stone-700 dark:text-[#F4EAD9]">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{isAmharic ? '50% ቅድመ-ክፍያ ማስያዣ' : '50% Deposit Reservation'}</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-black/10 dark:border-white/15 bg-black/[0.03] dark:bg-white/[0.04] text-stone-700 dark:text-[#F4EAD9]">
                  <Gift className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{isAmharic ? 'በየጥቅሌ ውስጥ አስቀምጥ' : 'Save to My Packages'}</span>
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-2.5">
              <Link
                to="/packages"
                className="w-full py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAmharic ? 'ጥቅል ማዘጋጃውን ይክፈቱ' : 'Open Package Builder'}</span>
              </Link>
              <Link
                to="/my-reservations"
                className={`w-full py-3 px-5 rounded-2xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  isDark ? 'border-[#4A2C16] hover:bg-[#2A1A0D]' : 'border-[#E4D4BC] hover:bg-[#FAF7F0]'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>{isAmharic ? 'የያዝኳቸው ንቁ ጥቅሎች' : 'My Active Reservations'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 5 Main Services - Clean Editorial Divided Layout */}
        <div className={`divide-y border-y mb-14 ${isDark ? 'divide-[#4A2C16] border-[#4A2C16]' : 'divide-[#E4D4BC] border-[#E4D4BC]'}`}>
          {livestockServices.map((service, index) => {
            const Icon = iconMap[service.iconName] || Truck;

            const amharicData = amharicServicesData[service.id];
            const localizedTitle = isAmharic && amharicData ? amharicData.title : service.title;
            const localizedBadge = isAmharic && amharicData ? amharicData.badge : '';
            const localizedDesc = isAmharic && amharicData ? amharicData.desc : service.fullDescription;
            const localizedHighlights = isAmharic && amharicData ? amharicData.highlights : service.highlights;

            return (
              <div
                key={service.id}
                id={service.id}
                className="py-7 sm:py-9 first:pt-4 last:pb-4 transition-colors"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                  
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

                    {localizedBadge && (
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-500 pt-1">
                        {service.id === 'meat-by-kg' ? (
                          <Building2 className="w-3.5 h-3.5 text-amber-500" />
                        ) : service.id === 'slaughter-prep' ? (
                          <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        <span>{localizedBadge}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Detailed Description & Highlights */}
                  <div className="lg:col-span-8 space-y-3">
                    <p
                      className={`text-xs sm:text-sm leading-relaxed ${
                        isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'
                      }`}
                    >
                      {localizedDesc}
                    </p>

                    {/* Highlights bullet list */}
                    <ul className="space-y-1.5 pt-1">
                      {localizedHighlights.map((h, i) => (
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

                    {/* Direct Contact Actions & Online Order */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-3">
                      {service.id === 'meat-by-kg' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!isAuthenticated) {
                              openAuthModal(
                                'register',
                                isAmharic
                                  ? 'የበሬ ስጋ በኪሎ ለማዘዝ እባክዎ መጀመሪያ ይመዝገቡ ወይም ይግቡ።'
                                  : 'To order raw beef by the KG, please create an account or sign in first.'
                              );
                              return;
                            }
                            setIsMeatModalOpen(true);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span>{isAmharic ? 'የበሬ ስጋ በኪሎ እዘዝ (ኦንላይን)' : 'Order Raw Meat in KG'}</span>
                        </button>
                      )}

                      <a
                        href={getWhatsAppLink(
                          business.whatsapp,
                          isAmharic
                            ? `ሰላም ጆኒ ሌቭስቶክ፣ ስለ '${localizedTitle}' አገልግሎት ዝርዝር ማወቅና ማዘዝ ፈልጌ ነበር።`
                            : `Hello Jonny Livestock, I would like to inquire about/order the '${service.title}' service.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all active:scale-[0.98]"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-white" />
                        <span>{isAmharic ? 'በዋትስአፕ ይጠይቁ / ይዘዙ' : 'Inquire on WhatsApp'}</span>
                      </a>

                      <a
                        href={getPhoneCallLink(business.phone)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                          isDark
                            ? 'border-[#4A2C16] text-[#D8C5A8] hover:bg-white/5'
                            : 'border-[#E4D4BC] text-[#746556] hover:bg-black/5'
                        }`}
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
                        <span>{business.displayPhone}</span>
                      </a>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* How Our Workflow Works (3-6 Steps) */}
        <div className="mb-14">
          <h2 className="font-serif font-bold text-2xl mb-6 text-center">
            {isAmharic ? 'የአገልግሎት አሰጣጥ ቅደም ተከተል' : 'How Farm-to-Door Delivery Works'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {serviceFlowSteps.map((step, idx) => {
              const flowAm = amharicFlowSteps[idx];
              const stepTitle = isAmharic && flowAm ? flowAm.title : step.title;
              const stepDesc = isAmharic && flowAm ? flowAm.description : step.description;

              return (
                <div
                  key={idx}
                  className={`p-6 rounded-3xl border space-y-3 ${
                    isDark ? 'bg-[#24170D] border-[#4A2C16]' : 'bg-white border-[#E4D4BC]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-black font-bold text-xs flex items-center justify-center">
                    0{idx + 1}
                  </div>
                  <h3 className="font-serif font-bold text-base">{stepTitle}</h3>
                  <p className="text-xs opacity-75 leading-relaxed">{stepDesc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Meat by KG Order Modal */}
        <MeatByKgOrderModal
          isOpen={isMeatModalOpen}
          onClose={() => setIsMeatModalOpen(false)}
        />
      </div>
    </div>
  );
};
