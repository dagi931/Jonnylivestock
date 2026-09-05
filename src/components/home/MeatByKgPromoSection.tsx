import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useUserAuth } from '../../context/UserAuthContext';
import { business } from '../../config/business';
import { api } from '../../services/api';
import { getWhatsAppLink, getPhoneCallLink } from '../../utils/formatters';
import { AnimatedReveal } from '../common/AnimatedReveal';
import { MeatByKgOrderModal } from '../modals/MeatByKgOrderModal';
import {
  Shield,
  ShieldCheck,
  Scale,
  Snowflake,
  Truck,
  Building2,
  ArrowRight,
  PhoneCall,
  MessageSquare,
  Beef,
  Utensils,
  CookingPot
} from 'lucide-react';

export const MeatByKgPromoSection: React.FC = () => {
  const { theme } = useTheme();
  const { isAmharic } = useLanguage();
  const { isAuthenticated, openAuthModal } = useUserAuth();
  const isDark = theme === 'design7';
  const [isMeatModalOpen, setIsMeatModalOpen] = useState(false);
  const [prices, setPrices] = useState({
    kurt: 2500,
    kitfo: 2200,
    wot: 1800
  });

  useEffect(() => {
    api.getMeatPricing().then((res) => {
      if (res) {
        setPrices({
          kurt: Number(res.kurtPrice) || 2500,
          kitfo: Number(res.kitfoPrice) || 2200,
          wot: Number(res.tibsWotPrice) || 1800
        });
      }
    });
  }, []);

  const beefDishes = [
    {
      id: 'kurt',
      icon: Beef,
      name: 'Tre Kurt / Tere Siga',
      amharicName: 'ጥሬ ቁርጥ',
      price: prices.kurt,
      desc: 'Prime tender raw cuts from high-grade fattened oxen',
      amharicDesc: 'ከምርጥ ሰንጋ የተመረጠ ለጥሬ የሚሆን ለስላሳ ሥጋ',
      badge: isAmharic ? 'ለጥሬ ቁርጥ' : 'Prime Raw Cut',
      image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'kitfo',
      icon: Utensils,
      name: 'Kitfo Cut',
      amharicName: 'ክትፎ',
      price: prices.kitfo,
      desc: 'Extra-lean red beef trimmed completely free of sinew',
      amharicDesc: 'ያለ ጅማትና ስብ በልዩ ሁኔታ የተዘጋጀ ለስላሳ ቀይ ስጋ',
      badge: isAmharic ? 'ለክትፎ' : 'Extra Lean Beef',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'wot',
      icon: CookingPot,
      name: 'Tibs & Wot Cut',
      amharicName: 'ጥብስ እና ወጥ',
      price: prices.wot,
      desc: 'Rich stew-sized beef chunks perfect for family wot pots and sizzling tibs',
      amharicDesc: 'ለጥብስና ለቤተሰብ ወጥ ድስ የሚሆን በንጽህና የተቆራረጠ ጣፋጭ ስጋ',
      badge: isAmharic ? 'ለጥብስና ወጥ' : 'Tibs & Stew',
      image: 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const quickFeatures = [
    {
      icon: Shield,
      title: isAmharic ? '100% ጥራት ያለው' : '100% Prime Quality'
    },
    {
      icon: Scale,
      title: isAmharic ? 'ዲጂታል ሚዛን' : 'Digital Weighing'
    },
    {
      icon: Snowflake,
      title: isAmharic ? 'በማቀዝቀዣ ትኩስ' : 'Refrigerated Freshness'
    },
    {
      icon: Truck,
      title: isAmharic ? 'በሰዓቱ ማድረስ' : 'On-Time Delivery'
    }
  ];

  const benefits = [
    {
      icon: Scale,
      title: 'Accurate Scale Weight',
      amharicTitle: 'ትክክለኛ የተመዘነ ሚዛን',
      desc: 'Every kilogram measured on precision certified digital scales.',
      amharicDesc: 'እያንዳንዱ ኪሎ ግራም በሚዛን ተመጥኖ በታማኝነት ይዘጋጃል።'
    },
    {
      icon: ShieldCheck,
      title: '100% Prime Fattened Beef',
      amharicTitle: '100% ጥራት ያለው የበሬ ሥጋ',
      desc: 'Inspected prime cuts from healthy cattle raised directly on our farm.',
      amharicDesc: 'በእርሻችን ከተመረጡ የሰቡ ሰንጋዎች ብቻ የተዘጋጀ።'
    },
    {
      icon: Truck,
      title: 'Refrigerated Direct Delivery',
      amharicTitle: 'በማቀዝቀዣ መኪና ማድረስ',
      desc: 'Temperature-controlled rapid transit to homes, hotels & event halls in Addis.',
      amharicDesc: 'ቀጥታ ወደ ቤትዎ፣ ሆቴልዎ ወይም የድግስ አዳራሽ በወቅቱ ይደርሳል።'
    },
    {
      icon: Building2,
      title: 'Hotels & Caterers Supply',
      amharicTitle: 'ለሆቴሎችና ሬስቶራንቶች የጅምላ ውል',
      desc: 'Daily, weekly, or event recurring supply agreements with reliable volume.',
      amharicDesc: 'ቋሚ የቀን ወይም የሳምንት የስጋ አቅርቦት ውል በጅምላ ዋጋ።'
    }
  ];

  const whatsappInquiryText = isAmharic
    ? `ሰላም ጆኒ ሌቭስቶክ፣ የበሬ ስጋ በኪሎግራም (KG) ማዘዝ ፈልጌ ነበር። (ቁርጥ: 2,800 ብር፣ ክትፎ: 2,200 ብር፣ ወጥ: 1,800 ብር)። እባክዎን የአቅርቦት ዝርዝር ያሳውቁኝ።`
    : `Hello Jonny Livestock, I would like to order fresh Beef by the KG (Kurt: 2,800 ETB/kg, Kitfo: 2,200 ETB/kg, Wot: 1,800 ETB/kg). Please confirm availability and delivery.`;

  return (
    <section
      className={`py-10 sm:py-16 border-b relative overflow-hidden transition-colors ${
        isDark
          ? 'bg-gradient-to-b from-[#21150B] via-[#2A1B0E] to-[#1C1208] border-[#4A2C16]'
          : 'bg-gradient-to-b from-[#FBF8F2] via-[#F4ECE0] to-[#EFE4D2] border-[#E4D4BC]'
      }`}
    >
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedReveal direction="up" delay={50}>
          <div
            className={`rounded-3xl p-5 sm:p-8 lg:p-10 border shadow-2xl relative overflow-hidden ${
              isDark
                ? 'bg-[#180E06]/95 border-[#4A2C16]'
                : 'bg-white/95 border-[#E8DAC6]'
            }`}
          >
            {/* Top Row: Hero Text (Left) & Actions Box (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start mb-10">
              
              {/* Left Column: Heading, Subhead, Paragraph, Price Pills */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Premium Quality Pill Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-500/30 bg-amber-500/10 text-amber-500">
                  <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    {isAmharic ? 'የታመነ ከፍተኛ ጥራት ያለው ምርት' : 'PREMIUM QUALITY YOU CAN TRUST'}
                  </span>
                </div>

                {/* Main Headline */}
                <h2
                  className={`font-serif font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.15] ${
                    isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
                  }`}
                >
                  {isAmharic ? (
                    <>
                      <span>ስጋ በኪሎ (KG) </span>
                      <span className="text-amber-500">መግዛት ይፈልጋሉ?</span>
                    </>
                  ) : (
                    <>
                      <span>Do You Want to Buy </span>
                      <br className="hidden sm:inline" />
                      <span className="text-amber-500">Fresh Meat</span>
                      <span> in KG?</span>
                    </>
                  )}
                </h2>

                {/* Subtitle */}
                <p className="text-amber-500 font-bold text-sm sm:text-base lg:text-lg leading-snug">
                  {isAmharic
                    ? '100% ከምርጥ ሰንጋ በንጽህና የተዘጋጀ የበሬ ስጋ በኪሎግራም'
                    : '100% Prime Ethiopian Beef Extracted & Weighed by Kilogram'}
                </p>

                {/* Body Description */}
                <p
                  className={`text-xs sm:text-sm leading-relaxed ${
                    isDark ? 'text-[#D8C5A8]/90' : 'text-[#746556]'
                  }`}
                >
                  {isAmharic ? (
                    <>
                      ለሆቴሎች፣ ለባህላዊ ሬስቶራንቶች፣ ለሰርግና ለተለያዩ ድግስ አዘጋጆች ወይም ለቤትዎ የሚሆን ጥራት ያለው የበሬ ስጋ በኪሎ እናቀርባለን።
                      ለ<strong className="font-bold text-amber-500"> ቁርጥ (2,800 ብር/ኪ.ግ)</strong>፣
                      <strong className="font-bold text-amber-500"> ክትፎ (2,200 ብር/ኪ.ግ)</strong> እና
                      <strong className="font-bold text-amber-500"> ወጥ (1,800 ብር/ኪ.ግ)</strong> በልዩ ሁኔታ ተዘጋጅቶ በትክክለኛ ሚዛን በማቀዝቀዣ መኪና ይደርሳል።
                    </>
                  ) : (
                    <>
                      We supply freshly slaughtered and inspected 100% prime Beef sold by the kilogram for hotels, traditional restaurants,
                      wedding banquets, catering kitchens, and family feasts. Hand-selected from fattened oxen and professionally prepared for{' '}
                      <strong className="font-semibold text-amber-500">Kurt (2,800 ETB/kg)</strong>,{' '}
                      <strong className="font-semibold text-amber-500">Kitfo (2,200 ETB/kg)</strong>, and{' '}
                      <strong className="font-semibold text-amber-500">Wot (1,800 ETB/kg)</strong> with precision digital weighing and refrigerated delivery.
                    </>
                  )}
                </p>

                {/* 3 Price Pills */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <div className="px-3.5 py-2 rounded-xl border border-amber-500/30 bg-[#120B05]/80 font-medium flex items-center gap-2 text-xs">
                    <Beef className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className={isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'}>
                      {isAmharic ? 'ቁርጥ:' : 'Kurt:'}
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">2,800 ETB/kg</span>
                  </div>

                  <div className="px-3.5 py-2 rounded-xl border border-amber-500/30 bg-[#120B05]/80 font-medium flex items-center gap-2 text-xs">
                    <Utensils className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className={isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'}>
                      {isAmharic ? 'ክትፎ:' : 'Kitfo:'}
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">2,200 ETB/kg</span>
                  </div>

                  <div className="px-3.5 py-2 rounded-xl border border-amber-500/30 bg-[#120B05]/80 font-medium flex items-center gap-2 text-xs">
                    <CookingPot className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className={isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'}>
                      {isAmharic ? 'ወጥ:' : 'Wot:'}
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">1,800 ETB/kg</span>
                  </div>
                </div>

              </div>

              {/* Right Column: Action Box & 4 Mini Badges */}
              <div className="lg:col-span-5">
                <div
                  className={`p-5 sm:p-6 rounded-3xl border shadow-lg space-y-3.5 ${
                    isDark
                      ? 'bg-[#150D06] border-[#3D2311]'
                      : 'bg-[#F9F4EB] border-[#E8DAC6]'
                  }`}
                >
                  {/* Primary Amber CTA Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!isAuthenticated) {
                        openAuthModal(
                          'register',
                          isAmharic
                            ? 'የበሬ ስጋ በኪሎግራም (KG) ለማዘዝ እባክዎ መጀመሪያ ይመዝገቡ ወይም ይግቡ።'
                            : 'To order fresh ox beef by the KG, please create an account or sign in first.'
                        );
                        return;
                      }
                      setIsMeatModalOpen(true);
                    }}
                    className="w-full inline-flex items-center justify-between px-5 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Beef className="w-4 h-4 text-black shrink-0" />
                      <span>{isAmharic ? 'የበሬ ስጋ በኪሎ እዘዝ / ዋጋ ተመልከት' : 'Order Beef in KG / View Services'}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  {/* WhatsApp Inquiry Button */}
                  <a
                    href={getWhatsAppLink(business.whatsapp, whatsappInquiryText)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border font-bold text-xs sm:text-sm transition-all ${
                      isDark
                        ? 'border-[#3D2311] bg-[#1E1207] text-[#25D366] hover:bg-[#2A190A]'
                        : 'border-[#E4D4BC] bg-white text-[#128C7E] hover:bg-[#FAF3E8]'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{isAmharic ? 'በዋትስአፕ ይጠይቁ' : 'WhatsApp Inquiry'}</span>
                  </a>

                  {/* Direct Phone Call Button */}
                  <a
                    href={getPhoneCallLink(business.phone)}
                    className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border font-bold text-xs sm:text-sm transition-all ${
                      isDark
                        ? 'border-[#3D2311] bg-[#1E1207] text-[#F4E8D0] hover:bg-[#2A190A]'
                        : 'border-[#E4D4BC] bg-white text-[#241A12] hover:bg-[#FAF3E8]'
                    }`}
                  >
                    <PhoneCall className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{business.displayPhone}</span>
                  </a>

                  {/* 4 Mini Feature Badges Row */}
                  <div className="grid grid-cols-4 gap-2 pt-4 border-t border-white/5 text-center">
                    {quickFeatures.map((f, i) => {
                      const Icon = f.icon;
                      return (
                        <div key={i} className="flex flex-col items-center justify-center space-y-1.5 p-1">
                          <Icon className="w-5 h-5 text-amber-500" />
                          <span className="text-[10px] sm:text-[11px] font-medium leading-tight opacity-90">
                            {f.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>

            </div>

            {/* Middle Section: BEEF CUTS & OFFICIAL PRICE PER KILOGRAM */}
            <div className="mb-10 pt-6 border-t" style={{ borderColor: isDark ? '#3D2311' : '#EAE0D0' }}>
              <div className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center justify-between">
                <span className={isDark ? 'text-[#F4E8D0]/90' : 'text-[#241A12]'}>
                  {isAmharic ? 'የበሬ ስጋ ዝግጅቶችና ይፋዊ የኪሎ ዋጋዎች:' : 'BEEF CUTS & OFFICIAL PRICE PER KILOGRAM:'}
                </span>
                <span className="text-xs text-amber-500 font-bold tracking-wider">
                  {isAmharic ? 'የእርሻ ቀጥታ ዋጋ' : 'DIRECT FARM RATES'}
                </span>
              </div>

              {/* 3 Rich Dish Cards with Photos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {beefDishes.map((dish) => (
                  <div
                    key={dish.id}
                    className={`rounded-2xl border p-3 sm:p-3.5 flex items-center gap-3.5 transition-all hover:border-amber-500/40 ${
                      isDark
                        ? 'bg-[#150D06] border-[#3D2311]'
                        : 'bg-[#F9F4EB] border-[#ECE2D2]'
                    }`}
                  >
                    {/* Square Image Thumbnail */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 relative bg-black/20">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Dish Info & Badge */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                      <div>
                        <div className="flex items-center justify-between gap-1.5">
                          <h4
                            className={`font-bold text-xs sm:text-sm truncate ${
                              isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
                            }`}
                          >
                            {isAmharic ? dish.amharicName : dish.name}
                          </h4>

                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                              isDark
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                            }`}
                          >
                            <dish.icon className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        <div className="font-mono text-emerald-400 font-extrabold text-xs sm:text-sm mt-0.5">
                          {dish.price.toLocaleString()}{' '}
                          <span className="text-[10px] font-normal text-stone-400">ETB/kg</span>
                        </div>

                        <p className="text-[11px] opacity-75 leading-tight line-clamp-2 mt-1">
                          {isAmharic ? dish.amharicDesc : dish.desc}
                        </p>
                      </div>

                      <div className="mt-2">
                        <span className="inline-block text-[10px] px-2 py-0.5 rounded-md font-medium bg-black/40 border border-white/10 text-stone-300">
                          {dish.badge}
                        </span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Row: 4 Guarantee Cards */}
            <div
              className="pt-6 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              style={{ borderColor: isDark ? '#3D2311' : '#EAE0D0' }}
            >
              {benefits.map((b, idx) => {
                const Icon = b.icon;
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h5
                        className={`font-bold text-xs ${
                          isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
                        }`}
                      >
                        {isAmharic ? b.amharicTitle : b.title}
                      </h5>
                      <p className="text-[11px] opacity-75 mt-0.5 leading-snug">
                        {isAmharic ? b.amharicDesc : b.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </AnimatedReveal>
      </div>

      {/* Interactive Beef in KG Ordering & Payment Modal */}
      <MeatByKgOrderModal
        isOpen={isMeatModalOpen}
        onClose={() => setIsMeatModalOpen(false)}
      />
    </section>
  );
};
