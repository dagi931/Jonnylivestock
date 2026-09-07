import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
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
  CookingPot,
  Sparkles
} from 'lucide-react';

export const MeatByKgPromoSection: React.FC = () => {
  const { theme } = useTheme();
  const { isAmharic } = useLanguage();
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
      desc: 'Prime tender raw beef cuts',
      amharicDesc: 'ለጥሬ የሚሆን ለስላሳ የበሬ ሥጋ',
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
      title: isAmharic ? 'ጥራት ያለው' : 'Prime Quality'
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
      title: 'Prime Quality Beef',
      amharicTitle: 'ጥራት ያለው የበሬ ሥጋ',
      desc: 'Inspected prime cuts from healthy cattle raised directly on our farm.',
      amharicDesc: 'በእርሻችን ከተመረጡ የሰቡ ከብቶች የተዘጋጀ።'
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
      className={`py-12 sm:py-20 border-b relative overflow-hidden transition-colors w-full ${
        isDark
          ? 'bg-gradient-to-b from-[#1C1208] via-[#160D05] to-[#120A04] border-[#3D2311]'
          : 'bg-gradient-to-b from-[#FBF8F2] via-[#F4ECE0] to-[#EFE4D2] border-[#E4D4BC]'
      }`}
    >
      {/* Subtle Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10 sm:space-y-14">
        {/* Top Hero: Headline, Story & Direct Actions (No enclosing card) */}
        <AnimatedReveal direction="up" delay={50}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading, Subtitle & Description */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-500/30 bg-amber-500/10 text-amber-500">
                <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  {isAmharic ? 'የታመነ ከፍተኛ ጥራት ያለው ምርት' : 'PREMIUM PRIME BEEF BY THE KG'}
                </span>
              </div>

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

              <p className="text-amber-500 font-bold text-sm sm:text-base lg:text-lg leading-snug">
                {isAmharic
                  ? 'በንጽህና የተዘጋጀ የበሬ ስጋ በኪሎግራም'
                  : 'Prime Ethiopian Beef Extracted & Precision Weighed by Kilogram'}
              </p>

              <p
                className={`text-xs sm:text-sm leading-relaxed max-w-2xl ${
                  isDark ? 'text-[#D8C5A8]/90' : 'text-[#746556]'
                }`}
              >
                {isAmharic ? (
                  <>
                    ለሆቴሎች፣ ለባህላዊ ሬስቶራንቶች፣ ለሰርግና ለተለያዩ ድግስ አዘጋጆች ወይም ለቤትዎ የሚሆን ጥራት ያለው የበሬ ስጋ በኪሎ እናቀርባለን።
                    ለ<strong className="font-bold text-amber-500"> ቁርጥ ({prices.kurt.toLocaleString()} ብር/ኪ.ግ)</strong>፣
                    <strong className="font-bold text-amber-500"> ክትፎ ({prices.kitfo.toLocaleString()} ብር/ኪ.ግ)</strong> እና
                    <strong className="font-bold text-amber-500"> ወጥ ({prices.wot.toLocaleString()} ብር/ኪ.ግ)</strong> በልዩ ሁኔታ ተዘጋጅቶ በትክክለኛ ዲጂታል ሚዛን በማቀዝቀዣ መኪና ይደርሳል።
                  </>
                ) : (
                  <>
                    We supply freshly slaughtered and inspected prime Beef sold by the kilogram for hotels, traditional restaurants,
                    wedding banquets, catering kitchens, and family feasts. Hand-selected and professionally prepared for{' '}
                    <strong className="font-semibold text-amber-500">Kurt ({prices.kurt.toLocaleString()} ETB/kg)</strong>,{' '}
                    <strong className="font-semibold text-amber-500">Kitfo ({prices.kitfo.toLocaleString()} ETB/kg)</strong>, and{' '}
                    <strong className="font-semibold text-amber-500">Wot ({prices.wot.toLocaleString()} ETB/kg)</strong> with certified digital scale precision and refrigerated delivery.
                  </>
                )}
              </p>
            </div>

            {/* Right Column: Direct Actions (No nested card box) */}
            <div className="lg:col-span-5 space-y-3">
              {/* Primary Order Button */}
              <button
                type="button"
                onClick={() => {
                  setIsMeatModalOpen(true);
                }}
                className="w-full inline-flex items-center justify-between px-6 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-sm sm:text-base shadow-xl transition-all active:scale-[0.98] group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Beef className="w-5 h-5 text-black shrink-0" />
                  <span>{isAmharic ? 'የበሬ ስጋ በኪሎ እዘዝ' : 'Order Beef in KG Online'}</span>
                </div>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>

              {/* Secondary Actions Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={getWhatsAppLink(business.whatsapp, whatsappInquiryText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border font-bold text-xs sm:text-sm transition-all ${
                    isDark
                      ? 'border-[#3D2311] bg-[#1E1207] text-[#25D366] hover:bg-[#2A190A]'
                      : 'border-[#E4D4BC] bg-white text-[#128C7E] hover:bg-[#FAF3E8]'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isAmharic ? 'በዋትስአፕ ይጠይቁ' : 'WhatsApp'}</span>
                </a>

                <a
                  href={getPhoneCallLink(business.phone)}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border font-bold text-xs sm:text-sm transition-all ${
                    isDark
                      ? 'border-[#3D2311] bg-[#1E1207] text-[#F4E8D0] hover:bg-[#2A190A]'
                      : 'border-[#E4D4BC] bg-white text-[#241A12] hover:bg-[#FAF3E8]'
                  }`}
                >
                  <PhoneCall className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{business.displayPhone}</span>
                </a>
              </div>
            </div>
          </div>
        </AnimatedReveal>

        {/* 4 Trust Highlights: Clean Divider Ribbon, Zero Container Boxes */}
        <AnimatedReveal direction="up" delay={100}>
          <div
            className={`grid grid-cols-2 md:grid-cols-4 py-4 sm:py-5 border-y ${
              isDark ? 'border-[#3D2311] divide-[#3D2311]' : 'border-[#E4D4BC] divide-[#E4D4BC]'
            } divide-y md:divide-y-0 md:divide-x`}
          >
            {quickFeatures.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-3 sm:px-4 flex items-center justify-center gap-2.5 text-center sm:text-left"
                >
                  <Icon className="w-5 h-5 text-amber-500 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold opacity-90 leading-tight">
                    {f.title}
                  </span>
                </div>
              );
            })}
          </div>
        </AnimatedReveal>

        {/* 3 Prime Cuts Section */}
        <AnimatedReveal direction="up" delay={150}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                  {isAmharic ? 'የእርሻ ቀጥታ ዋጋ' : 'DIRECT FARM PRICING'}
                </span>
                <h3
                  className={`font-serif font-bold text-xl sm:text-2xl mt-0.5 ${
                    isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
                  }`}
                >
                  {isAmharic ? 'የበሬ ስጋ ዝግጅቶችና የኪሎ ዋጋዎች' : 'Prime Beef Cuts & Price Per Kilogram'}
                </h3>
              </div>

              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-emerald-400 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Certified Scale</span>
              </span>
            </div>

            {/* 3 Streamlined Cut Cards - 2 in one row on phone screens */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6">
              {beefDishes.map((dish) => (
                <div
                  key={dish.id}
                  className={`rounded-2xl border overflow-hidden transition-all duration-200 hover:border-amber-500/50 flex flex-col ${
                    isDark
                      ? 'bg-[#180F07]/90 border-[#3D2311]'
                      : 'bg-white border-[#E8DAC6]'
                  }`}
                >
                  {/* Photo Banner */}
                  <div className="aspect-[4/3] sm:aspect-auto sm:h-44 md:h-48 w-full overflow-hidden relative bg-black/20">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[9.5px] sm:text-[11px] font-bold bg-black/75 backdrop-blur-md text-white border border-white/10">
                      {dish.badge}
                    </div>
                  </div>

                  {/* Cut Details */}
                  <div className="p-2.5 sm:p-4 md:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5 sm:gap-2">
                        <h4
                          className={`font-bold text-xs sm:text-base md:text-lg leading-tight truncate ${
                            isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
                          }`}
                        >
                          {isAmharic ? dish.amharicName : dish.name}
                        </h4>
                        <div className="font-mono text-emerald-400 font-extrabold text-xs sm:text-base md:text-lg shrink-0">
                          {dish.price.toLocaleString()}{' '}
                          <span className="text-[9.5px] sm:text-xs font-normal text-stone-400">ETB/kg</span>
                        </div>
                      </div>

                      <p
                        className={`text-[10.5px] sm:text-xs leading-relaxed mt-1 sm:mt-2 line-clamp-2 sm:line-clamp-3 ${
                          isDark ? 'text-[#D8C5A8]/80' : 'text-[#746556]'
                        }`}
                      >
                        {isAmharic ? dish.amharicDesc : dish.desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMeatModalOpen(true);
                      }}
                      className="w-full py-2 sm:py-2.5 rounded-xl border border-amber-500/40 hover:bg-amber-500 hover:text-black text-amber-500 font-bold text-[11px] sm:text-xs transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5"
                    >
                      <Beef className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                      <span>{isAmharic ? 'ይህንን ቁራጭ እዘዝ' : 'Order This Cut'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedReveal>

        {/* Bottom Guarantees: Displayed in One Single Row */}
        <AnimatedReveal direction="up" delay={200}>
          <div className="pt-4 grid grid-cols-4 gap-2 sm:gap-4 md:gap-6">
            {benefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1.5 sm:gap-3.5 min-w-0"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5
                      className={`font-bold text-[10.5px] sm:text-xs md:text-sm leading-tight ${
                        isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
                      }`}
                    >
                      {isAmharic ? b.amharicTitle : b.title}
                    </h5>
                    <p
                      className={`text-[9.5px] sm:text-[11px] md:text-xs opacity-75 mt-0.5 sm:mt-1 leading-snug ${
                        isDark ? 'text-[#D8C5A8]/80' : 'text-[#746556]'
                      }`}
                    >
                      {isAmharic ? b.amharicDesc : b.desc}
                    </p>
                  </div>
                </div>
              );
            })}
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
