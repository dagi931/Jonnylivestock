import { PackageCatalogItem, PreMadePackage } from '../types/package';

export const PACKAGE_CATALOG: PackageCatalogItem[] = [
  // ==================== 1. MEAT & LIVESTOCK ====================
  {
    id: 'pkg-hen-01',
    category: 'meat_livestock',
    name: 'Organic Country Rooster / Hen',
    amharicName: 'የሀገር ቤት የሰባ ዶሮ',
    description: 'Naturally pasture-raised, healthy Habesha rooster with firm, flavorful meat perfect for Doro Wat.',
    price: 1800,
    unit: 'per live head',
    image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'pkg-sheep-01',
    category: 'meat_livestock',
    name: 'Highland Menz Ram / Sheep',
    amharicName: 'ደንዳና የመንዝ በግ',
    description: 'Prime highland ram with tender marbling, ideal for holiday roasting, tibs, and festive stews.',
    price: 14500,
    unit: 'per head (~30kg)',
    image: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'pkg-goat-01',
    category: 'meat_livestock',
    name: 'Hararghe Tender Goat',
    amharicName: 'የሐረርጌ ምርጥ ፍየል',
    description: 'Lean and succulent highland goat raised on wild acacia browse and mountain grass.',
    price: 13000,
    unit: 'per head (~28kg)',
    image: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'pkg-ox-01',
    category: 'meat_livestock',
    name: 'Boran Celebration Ox',
    amharicName: 'የቦረና የሰባ ሰንጋ በሬ',
    description: 'Substantial, well-fattened Boran steer for large family banquets, weddings, and community feasts.',
    price: 75000,
    unit: 'per head (~350kg)',
    image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pkg-meat-5kg',
    category: 'meat_livestock',
    name: 'Prime Cut Beef (5 KG)',
    amharicName: 'ልዩ ጥራት ያለው የበሬ ሥጋ (5 ኪ.ግ)',
    description: 'Freshly slaughtered, professionally inspected and vacuum-chilled steak & stew cuts.',
    price: 4500,
    unit: '5 KG Pack',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'pkg-meat-10kg',
    category: 'meat_livestock',
    name: 'Holiday Mixed Cuts (10 KG)',
    amharicName: 'የበዓል የበሬና የበግ ሥጋ (10 ኪ.ግ)',
    description: 'Generous combination of tender beef ribs, loin cuts, and fresh mutton chops for celebrations.',
    price: 8500,
    unit: '10 KG Pack',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
  },

  // ==================== 2. WINE & TRADITIONAL BEVERAGES ====================
  {
    id: 'pkg-wine-awash',
    category: 'wine',
    name: 'Awash Axumite / Crystal Wine',
    amharicName: 'አዋሽ አክሱማይት ወይን',
    description: 'Iconic Ethiopian sweet red wine crafted from estate-grown grapes with rich fruit notes.',
    price: 1200,
    unit: '750ml Bottle',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'pkg-wine-rift',
    category: 'wine',
    name: 'Rift Valley Reserve Merlot / Syrah',
    amharicName: 'ሪፍት ቫሊ ሪዘርቭ ወይን',
    description: 'Premium dry red wine from the volcanic soils of the Great Rift Valley, Ziway.',
    price: 1850,
    unit: '750ml Bottle',
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'pkg-wine-gouder',
    category: 'wine',
    name: 'Gouder Classic Ethiopian Red',
    amharicName: 'ጉደር ክላሲክ ወይን',
    description: 'Full-bodied traditional dry red wine paired impeccably with spicy stews and kitfo.',
    price: 1400,
    unit: '750ml Bottle',
    image: 'https://images.unsplash.com/photo-1560512823-829485b8bf24?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pkg-wine-tej',
    category: 'wine',
    name: 'Pure Highland Honey Tej (2L Flagon)',
    amharicName: 'የማር ጠጅ በብርሌ (2 ሊትር)',
    description: 'Traditional royal Ethiopian honey wine fermented with wild gesho and aged amber honey.',
    price: 1100,
    unit: '2 Litre Flagon',
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&w=800&q=80',
    popular: true
  },

  // ==================== 3. FARM FRESH EGGS ====================
  {
    id: 'pkg-egg-crate',
    category: 'eggs',
    name: 'Farm Fresh Brown Eggs (Full Crate)',
    amharicName: 'ትኩስ የሀገር እንቁላል (ሙሉ ካርቶን - 30 ፍሬ)',
    description: '30 large, free-range pasture-laid brown eggs with vibrant golden yolks for Doro Wat.',
    price: 900,
    unit: 'Crate (30 pcs)',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'pkg-egg-half',
    category: 'eggs',
    name: 'Pasture Eggs (Half Crate - 15 pcs)',
    amharicName: 'የጓሮ እንቁላል (ግማሽ ካርቶን - 15 ፍሬ)',
    description: '15 freshly harvested organic eggs packed securely in protective eco-friendly carton.',
    price: 480,
    unit: 'Half Crate (15 pcs)',
    image: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=800&q=80'
  },

  // ==================== 4. CELEBRATION FLOWERS ====================
  {
    id: 'pkg-flower-roses',
    category: 'flowers',
    name: 'Luxury Fresh Red Rose Bouquet (12 Stems)',
    amharicName: 'ውብ የቀይ ጽጌረዳ አበባ እቅፍ (12 ፍሬ)',
    description: 'Hand-picked long-stemmed highland roses elegantly wrapped with festive ribbons.',
    price: 1500,
    unit: '12 Stems Bouquet',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'pkg-flower-adey',
    category: 'flowers',
    name: 'Festive Adey Abeba Bouquet',
    amharicName: 'የበዓል አደይ አበባና ልዩ የማሳ አበባ እቅፍ',
    description: 'Vibrant yellow Adey Abeba and field daisies symbolizing Ethiopian new beginnings and joy.',
    price: 1100,
    unit: 'Holiday Arrangement',
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'pkg-flower-grand',
    category: 'flowers',
    name: 'Grand Celebration Bloom Basket',
    amharicName: 'የተዋበ የበዓል አበባ ቅርጫት',
    description: 'Lush hand-crafted basket with assorted lilies, roses, baby’s breath, and decorative greenery.',
    price: 2200,
    unit: 'Celebration Basket',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80'
  }
];

export const PRE_MADE_PACKAGES: PreMadePackage[] = [
  {
    id: 'pkg-holiday-grand-feast',
    name: 'Holiday Grand Feast Package',
    amharicName: 'የበዓል ድግስ ታላቅ ጥቅል',
    tagline: 'Complete 4-in-1 Festive Centerpiece',
    amharicTagline: 'የተሟላ ባለ 4-በ-1 የበዓል ድግስ',
    description: 'Highland Menz Sheep + Rift Valley Reserve Wine + 1 Crate Farm Fresh Eggs + Luxury Red Rose Bouquet. Free VIP refrigerated delivery included.',
    amharicDescription: 'ደንዳና የመንዝ በግ + ሪፍት ቫሊ ወይን + 1 ካርቶን ትኩስ እንቁላል + ውብ የቀይ ጽጌረዳ እቅፍ። ነፃ ማድረሻን ጨምሮ።',
    categoryCount: 4,
    items: [
      PACKAGE_CATALOG.find(i => i.id === 'pkg-sheep-01')!,
      PACKAGE_CATALOG.find(i => i.id === 'pkg-wine-rift')!,
      PACKAGE_CATALOG.find(i => i.id === 'pkg-egg-crate')!,
      PACKAGE_CATALOG.find(i => i.id === 'pkg-flower-roses')!
    ],
    originalPrice: 18600,
    packagePrice: 16900,
    savings: 1700,
    image: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=1000&q=80',
    featured: true,
    totalSlots: 12,
    availableSlots: 12,
    isOutOfStock: false
  },
  {
    id: 'pkg-family-festive-hamper',
    name: 'Family Festive Celebration Box',
    amharicName: 'የቤተሰብ በዓል የዶሮና ወይን ጥቅል',
    tagline: 'The Perfect Doro Wat & Toast Set',
    amharicTagline: 'ለዶሮ ወጥና ለደስታ የተዘጋጀ ምርጥ ስጦታ',
    description: '2 Country Organic Roosters + Awash Axumite Red Wine + 1 Crate Fresh Eggs (30 pcs) + Festive Adey Abeba Bouquet. Free prompt doorstep delivery.',
    amharicDescription: '2 የሀገር ቤት የሰባ ዶሮዎች + አዋሽ አክሱማይት ወይን + 1 ካርቶን እንቁላል (30 ፍሬ) + የበዓል አደይ አበባ እቅፍ። ነፃ ማድረሻን ጨምሮ።',
    categoryCount: 4,
    items: [
      PACKAGE_CATALOG.find(i => i.id === 'pkg-hen-01')!,
      PACKAGE_CATALOG.find(i => i.id === 'pkg-wine-awash')!,
      PACKAGE_CATALOG.find(i => i.id === 'pkg-egg-crate')!,
      PACKAGE_CATALOG.find(i => i.id === 'pkg-flower-adey')!
    ],
    originalPrice: 5550,
    packagePrice: 4850,
    savings: 700,
    image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1000&q=80',
    featured: true,
    totalSlots: 15,
    availableSlots: 15,
    isOutOfStock: false
  },
  {
    id: 'pkg-traditional-goat-tej',
    name: 'Traditional Hararghe Goat & Pure Tej Set',
    amharicName: 'የሐረርጌ ፍየልና የማር ጠጅ ጥቅል',
    tagline: 'Authentic Heritage Celebration',
    amharicTagline: 'ባህላዊ የደስታና የድግስ ሙሉ ጥቅል',
    description: 'Prime Hararghe Tender Goat + 2L Traditional Pure Honey Tej + 1 Crate Farm Eggs (30 pcs). Free delivery & optional slaughter preparation.',
    amharicDescription: 'የሐረርጌ ምርጥ ፍየል + 2 ሊትር ንጹህ የማር ጠጅ + 1 ካርቶን እንቁላል (30 ፍሬ)። ነፃ ማድረሻና የዕርድ ዝግጅትን ጨምሮ።',
    categoryCount: 3,
    items: [
      PACKAGE_CATALOG.find(i => i.id === 'pkg-goat-01')!,
      PACKAGE_CATALOG.find(i => i.id === 'pkg-wine-tej')!,
      PACKAGE_CATALOG.find(i => i.id === 'pkg-egg-crate')!
    ],
    originalPrice: 14700,
    packagePrice: 13900,
    savings: 800,
    image: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=1000&q=80',
    featured: true,
    totalSlots: 10,
    availableSlots: 10,
    isOutOfStock: false
  },
  {
    id: 'pkg-gourmet-meat-wine',
    name: 'Prime Gourmet Meat & Wine Hamper',
    amharicName: 'ልዩ የሥጋና ወይን በዓል ጥቅል',
    tagline: 'Cut & Prepared Meat with Wine & Blooms',
    amharicTagline: 'የተመረጠ ሥጋ፣ ወይንና ውብ አበቦች',
    description: '10 KG Prime Mixed Beef/Mutton + Awash Axumite Wine + 1 Crate Eggs (30 pcs) + Luxury Red Rose Bouquet. Free temperature-controlled delivery.',
    amharicDescription: '10 ኪ.ግ የተመረጠ የበሬና የበግ ሥጋ + አዋሽ አክሱማይት ወይን + 1 ካርቶን እንቁላል + ውብ የቀይ ጽጌረዳ እቅፍ። ነፃ ማድረሻን ጨምሮ።',
    categoryCount: 4,
    items: [
      PACKAGE_CATALOG.find(i => i.id === 'pkg-meat-10kg')!,
      PACKAGE_CATALOG.find(i => i.id === 'pkg-wine-awash')!,
      PACKAGE_CATALOG.find(i => i.id === 'pkg-egg-crate')!,
      PACKAGE_CATALOG.find(i => i.id === 'pkg-flower-roses')!
    ],
    originalPrice: 11950,
    packagePrice: 10900,
    savings: 1050,
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1000&q=80',
    featured: true,
    totalSlots: 10,
    availableSlots: 10,
    isOutOfStock: false
  }
];
