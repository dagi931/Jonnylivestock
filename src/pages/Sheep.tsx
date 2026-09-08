import React from 'react';
import { AnimalCategoryPage } from '../components/animals/AnimalCategoryPage';
import { useLanguage } from '../context/LanguageContext';

export const Sheep: React.FC = () => {
  const { t } = useLanguage();

  return (
    <AnimalCategoryPage
      type="sheep"
      breadcrumbLabel={t.nav.sheep}
      title={{
        en: 'Available Sheep',
        am: 'የሚገኙ በጎች'
      }}
      description={{
        en: 'Browse our current flock of Debrebirhan, Ginchi, Wolayita, and Arsi sheep. All animals are weighed accurately with transparent direct pricing.',
        am: 'የደብረ ብርሃን፣ የጊንጪ፣ የወላይታና የአርሲ ዝርያ በጎችን ይመልከቱ። ሁሉም እንስሳት በትክክለኛ ሚዛን የተመዘኑና የቀጥታ አቅራቢ ዋጋ ያላቸው ናቸው።'
      }}
      typeLabel={{
        en: 'sheep',
        am: 'በጎች'
      }}
      emptyTitle={{
        en: 'No sheep match your criteria',
        am: 'ምንም አይነት የተገኘ በግ የለም'
      }}
      emptySubtitle={{
        en: 'Try resetting your filters or adjusting your price/weight ranges.',
        am: 'እባክዎ ማጣሪያዎችን ያጽዱ ወይም የዋጋና የክብደት ክልሎችን ያስተካክሉ።'
      }}
    />
  );
};

