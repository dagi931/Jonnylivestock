import React from 'react';
import { AnimalCategoryPage } from '../components/animals/AnimalCategoryPage';
import { useLanguage } from '../context/LanguageContext';

export const Cows: React.FC = () => {
  const { t } = useLanguage();

  return (
    <AnimalCategoryPage
      type="cow"
      breadcrumbLabel={t.nav.cows}
      title={{
        en: 'Available Cows & Cattle',
        am: 'የሚገኙ ከብቶችና ሰንጋዎች'
      }}
      description={{
        en: 'Browse our Boran bulls, Fogera cows, Begait steers, and local highland oxen. Accurate live weights and direct single-seller pricing.',
        am: 'የቦረና፣ የፎገራና የበጋይት ሰንጋዎችንና ላሞችን ይመልከቱ። ትክክለኛ የቀጥታ ሚዛን ክብደትና ግልጽ የእርሻ ዋጋ።'
      }}
      typeLabel={{
        en: 'cows',
        am: 'ከብቶች'
      }}
      emptyTitle={{
        en: 'No cows match your criteria',
        am: 'ምንም አይነት የተገኘ ከብት የለም'
      }}
      emptySubtitle={{
        en: 'Try resetting your filters or adjusting your price/weight ranges.',
        am: 'እባክዎ ማጣሪያዎችን ያጽዱ ወይም የዋጋና የክብደት ክልሎችን ያስተካክሉ።'
      }}
    />
  );
};

