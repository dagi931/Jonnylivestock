import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Scale, Sparkles, Truck, UtensilsCrossed, PartyPopper, ArrowRight } from 'lucide-react';
import { livestockServices } from '../../data/services';
import { AnimatedReveal } from '../common/AnimatedReveal';

export const ServicesOverview: React.FC = () => {
  const { theme } = useTheme();
  const { t, isAmharic } = useLanguage();
  const isDark = theme === 'design7';

  const iconMap: Record<string, React.ElementType> = {
    Scale,
    Sparkles,
    Truck,
    UtensilsCrossed,
    PartyPopper
  };

  const amharicServiceData: Record<string, { title: string; desc: string }> = {
    'delivery': {
      title: 'የቀጥታ ከብትና በጎች ማድረስ',
      desc: 'ከአዋሬው እርሻችን በቀጥታ ወደ ቤትዎ ወይም ድርጅትዎ በአስተማማኝ ተሽከርካሪና ረዳት እረኞች ማድረስ።'
    },
    'slaughter-prep': {
      title: 'በቦታው ላይ የዕርድና የስጋ ዝግጅት አገልግሎት',
      desc: 'የሰለጠነ ባለሙያ በቦታው ድረስ በመምጣት ንጹህ ዕርድ፣ ቆዳ መግፈፍና ስጋ ማዘጋጀት ያከናውናል።'
    },
    'events-ceremonies': {
      title: 'ለበዓላት፣ ለሰርግና ለተለያዩ ዝግጅቶች',
      desc: 'ለበዓል ድግስ፣ ለሰርግና ለተለያዩ ዝግጅቶች የሚሆኑ የተመረጡ ሰንጋዎች፣ በጎችና ፍየሎች ከሙሉ አገልግሎት ጋር።'
    },
    'meat-by-kg': {
      title: 'የበሬ ስጋ በኪሎ ለሆቴሎችና ሬስቶራንቶች',
      desc: 'ከምርጥ ሰንጋ የተዘጋጀ የበሬ ስጋ በኪሎ፡ ቁርጥ (2,800 ብር)፣ ክትፎ (2,200 ብር)፣ ወጥ (1,800 ብር) በትክክለኛ ሚዛን እናቀርባለን።'
    },
    'fresh-slaughtered-sheep': {
      title: 'የታረደ ትኩስ በግ ማድረስ',
      desc: 'በንጽህና የታረደና የተዘጋጀ ትኩስ በግ ወዲያውኑ ወደ ደጃፍዎ ይደርሳል።'
    }
  };

  return (
    <section
      className={`py-8 sm:py-12 border-t transition-colors ${
        isDark ? 'bg-[#1F150A] border-[#4A2C16]' : 'bg-[#FAF7F0] border-[#E4D4BC]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <AnimatedReveal direction="up" delay={50}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'
                }`}
              >
                {t.servicesOverview.badge}
              </span>
              <h2
                className={`font-serif font-bold text-2xl sm:text-3xl mt-0.5 ${
                  isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
                }`}
              >
                {t.servicesOverview.title}
              </h2>
              <p
                className={`mt-1 text-xs sm:text-sm max-w-xl ${
                  isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'
                }`}
              >
                {t.servicesOverview.subtext}
              </p>
            </div>

            <Link
              to="/services"
              className={`inline-flex items-center gap-1 font-semibold text-xs sm:text-sm transition-colors group shrink-0 ${
                isDark ? 'text-[#E0B15A] hover:text-[#F4E8D0]' : 'text-[#B8792F] hover:text-[#241A12]'
              }`}
            >
              <span>{t.servicesOverview.exploreAll}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </AnimatedReveal>

        {/* 5 Services - Clean Responsive Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2`}>
          {livestockServices.map((service, index) => {
            const Icon = iconMap[service.iconName] || Truck;
            const title = isAmharic && amharicServiceData[service.id] ? amharicServiceData[service.id].title : service.title;
            const desc = isAmharic && amharicServiceData[service.id] ? amharicServiceData[service.id].desc : service.shortDescription;

            return (
              <AnimatedReveal key={service.id} direction="up" delay={80 + index * 75} className="h-full">
                <div
                  className={`h-full p-5 rounded-2xl border flex flex-col justify-between space-y-3 transition-all hover:-translate-y-1 ${
                    isDark
                      ? 'bg-[#2A1A0D] border-[#4A2C16] hover:border-[#C58A3A]/60'
                      : 'bg-[#F1E8D8] border-[#E4D4BC] hover:border-[#B8792F]/60'
                  }`}
                >
                <div>
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isDark
                          ? 'bg-[#1B1208] text-[#C58A3A] border border-[#4A2C16]'
                          : 'bg-[#FAF7F0] text-[#B8792F] border border-[#E4D4BC]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-xs font-mono font-bold tracking-widest ${isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'}`}>
                      0{index + 1}
                    </span>
                  </div>

                  <h3
                    className={`font-serif font-bold text-sm sm:text-base mb-1 ${
                      isDark ? 'text-[#F4E8D0]' : 'text-[#241A12]'
                    }`}
                  >
                    {title}
                  </h3>

                  <p
                    className={`text-xs leading-relaxed ${
                      isDark ? 'text-[#D8C5A8]' : 'text-[#746556]'
                    }`}
                  >
                    {desc}
                  </p>
                </div>

                <div>
                  <Link
                    to={`/services#${service.id}`}
                    className={`inline-flex items-center gap-1 text-xs font-bold transition-colors ${
                      isDark ? 'text-[#E0B15A] hover:underline' : 'text-[#B8792F] hover:underline'
                    }`}
                  >
                    <span>{t.servicesOverview.viewService}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </AnimatedReveal>
          );
        })}
        </div>

      </div>
    </section>
  );
};
