import React from 'react';
import { AnimalCategoryPage } from '../components/animals/AnimalCategoryPage';
import { useLanguage } from '../context/LanguageContext';

export const Goats: React.FC = () => {
  const { t } = useLanguage();

  return (
    <AnimalCategoryPage
      type="goat"
      breadcrumbLabel={t.nav.goats}
      title={{
        en: 'Available Goats',
        am: 'የሚገኙ ፍየሎች'
      }}
      description={{
        en: 'Browse our Boer Cross, Hararghe Highland, Abergelle, and Central Highland goats with detailed weights, pricing, and health records.',
        am: 'የቦየር ክሮስ፣ የሐረርጌ ደጋ፣ የአበርገሌና የማዕከላዊ ደጋ ፍየሎችን ከሙሉ ክብደት፣ ዋጋና የጤና መረጃ ጋር ይመልከቱ።'
      }}
      typeLabel={{
        en: 'goats',
        am: 'ፍየሎች'
      }}
      emptyTitle={{
        en: 'No goats match your criteria',
        am: 'ምንም አይነት የተገኘ ፍየል የለም'
      }}
      emptySubtitle={{
        en: 'Try resetting your filters or adjusting your price/weight ranges.',
        am: 'እባክዎ ማጣሪያዎችን ያጽዱ ወይም የዋጋና የክብደት ክልሎችን ያስተካክሉ።'
      }}
    />
  );
};

