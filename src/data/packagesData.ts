import { PackageCatalogItem, PreMadePackage } from '../types/package';

export const PACKAGE_CATALOG: PackageCatalogItem[] = [
  // ==================== 1. MEAT & LIVESTOCK ====================
  {
    id: 'pkg-hen-01',
    category: 'meat_livestock',
    name: 'Organic Country Rooster / Hen',
    amharicName: 'የሀገር ቤት የሰባ ዶሮ',
    description: 'Naturally pasture-raised, healthy Habesha rooster with firm, flavorful meat perfect for Doro Wat.',
    amharicDescription: 'በተፈጥሮ ያደገ፣ ለዶሮ ወጥ ተመራጭ የሆነ የሰባ የሀበሻ ዶሮ።',
    price: 1800,
    unit: 'per live head',
    amharicUnit: 'በፍሬ',
    image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'pkg-sheep-01',
    category: 'meat_livestock',
    name: 'Debrebirhan Prime Ram / Sheep',
    amharicName: 'ደንዳና የደብረ ብርሃን በግ',
    description: 'Prime highland ram with tender marbling, ideal for holiday roasting, tibs, and festive stews.',
    amharicDescription: 'ለበዓል ጥብስ፣ ወጥ እና ለድግስ የሚሆን ጥራት ያለው ደንዳና የደብረ ብርሃን በግ።',
    price: 14500,
    unit: 'per head (~30kg)',
    amharicUnit: 'በራስ (~30 ኪ.ግ)',
    image: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'pkg-goat-01',
    category: 'meat_livestock',
    name: 'Ginchi Tender Goat',
    amharicName: 'የጊንጪ ምርጥ ፍየል',
    description: 'Lean and succulent highland goat raised on wild acacia browse and mountain grass.',
    amharicDescription: 'በተፈጥሮ ሳርና ቅጠል የሰባ፣ ለስላሳና ተወዳጅ የጊንጪ ፍየል።',
    price: 13000,
    unit: 'per head (~28kg)',
    amharicUnit: 'በራስ (~28 ኪ.ግ)',
    image: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'pkg-ox-01',
    category: 'meat_livestock',
    name: 'Arsi Celebration Ox',
    amharicName: 'የአርሲ የሰባ ሰንጋ በሬ',
    description: 'Substantial, well-fattened Arsi steer for large family banquets, weddings, and community feasts.',
    amharicDescription: 'ለታላላቅ የቤተሰብ ድግሶች፣ ለሰርግና ለበዓላት የሚሆን የሰባ የአርሲ ሰንጋ በሬ።',
    price: 75000,
    unit: 'per head (~350kg)',
    amharicUnit: 'በራስ (~350 ኪ.ግ)',
    image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pkg-meat-5kg',
    category: 'meat_livestock',
    name: 'Prime Cut Beef (5 KG)',
    amharicName: 'ልዩ ጥራት ያለው የበሬ ሥጋ (5 ኪ.ግ)',
    description: 'Freshly slaughtered, professionally inspected and vacuum-chilled steak & stew cuts.',
    amharicDescription: 'በንፅህና የታረደ፣ የተመረመረና በማቀዝቀዣ የተዘጋጀ ጥራት ያለው የበሬ ሥጋ።',
    price: 4500,
    unit: '5 KG Pack',
    amharicUnit: '5 ኪ.ግ ጥቅል',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'pkg-meat-10kg',
    category: 'meat_livestock',
    name: 'Holiday Mixed Cuts (10 KG)',
    amharicName: 'የበዓል የበሬና የበግ ሥጋ (10 ኪ.ግ)',
    description: 'Generous combination of tender beef ribs, loin cuts, and fresh mutton chops for celebrations.',
    amharicDescription: 'ለበዓል ድግስ የሚሆን የተመረጠ የበሬና የበግ ሥጋ ቅንብር።',
    price: 8500,
    unit: '10 KG Pack',
    amharicUnit: '10 ኪ.ግ ጥቅል',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
  },

  // ==================== 2. WINES, WHISKIES & TRADITIONAL BEVERAGES ====================
  {
    id: 'pkg-whisky-jw-red',
    category: 'wine',
    name: 'Johnnie Walker Red Label Scotch Whisky',
    amharicName: 'ጆኒ ዎከር ሬድ ሌብል ዊስኪ',
    description: 'World’s favorite vibrant blended Scotch whisky with bold, dynamic spices and a smoky finish.',
    amharicDescription: 'ዝነኛውና ተወዳጁ ጆኒ ዎከር ሬድ ሌብል ስኮች ዊስኪ ለበዓላትና ለደስታ ድግሶች።',
    price: 4500,
    unit: '750ml Bottle',
    amharicUnit: '750 ሚ.ሊ ጠርሙስ',
    image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'pkg-whisky-jw-black',
    category: 'wine',
    name: 'Johnnie Walker Black Label 12 Year Scotch',
    amharicName: 'ጆኒ ዎከር ብላክ ሌብል 12 ዓመት ዊስኪ',
    description: 'Iconic 12-year blended Scotch whisky delivering deep layers of dark fruits, sweet vanilla, and signature smokiness.',
    amharicDescription: 'ለ12 ዓመታት የቆየ፣ ለስላሳና ከፍተኛ ጥራት ያለው ምርጥ ጆኒ ዎከር ብላክ ሌብል ዊስኪ።',
    price: 7500,
    unit: '750ml Bottle',
    amharicUnit: '750 ሚ.ሊ ጠርሙስ',
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'pkg-whisky-jw-double-black',
    category: 'wine',
    name: 'Johnnie Walker Double Black Scotch Whisky',
    amharicName: 'ጆኒ ዎከር ደብል ብላክ ዊስኪ',
    description: 'Intense and full-bodied Scotch matured in deeply charred oak casks for an amplified peat smoke and rich spice.',
    amharicDescription: 'በከፍተኛ ጭስና ቅመም ጣዕም የታወቀ ልዩና ተመራጭ ጆኒ ዎከር ደብል ብላክ ዊስኪ።',
    price: 9200,
    unit: '750ml Bottle',
    amharicUnit: '750 ሚ.ሊ ጠርሙስ',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pkg-whisky-jw-gold',
    category: 'wine',
    name: 'Johnnie Walker Gold Label Reserve Scotch',
    amharicName: 'ጆኒ ዎከር ጎልድ ሌብል ሪዘርቭ ዊስኪ',
    description: 'Luxurious, creamy celebration blend with vibrant waves of honey, delicate spice, and velvety smooth finish.',
    amharicDescription: 'ለልዩ የበዓልና የደስታ አጋጣሚዎች የሚሆን ማራኪና ጣፋጭ ጆኒ ዎከር ጎልድ ሌብል ዊስኪ።',
    price: 13500,
    unit: '750ml Bottle',
    amharicUnit: '750 ሚ.ሊ ጠርሙስ',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'pkg-whisky-jw-blue',
    category: 'wine',
    name: 'Johnnie Walker Blue Label Rare Scotch',
    amharicName: 'ጆኒ ዎከር ብሉ ሌብል የቅንጦት ዊስኪ',
    description: 'The pinnacle of Scotch craftsmanship blending Scotland’s rarest casks for extraordinary velvet smoothness.',
    amharicDescription: 'እጅግ ውድና ብርቅዬ ከሆኑ የስኮትላንድ ዊስኪዎች የተቀመመ የቅንጦት ጆኒ ዎከር ብሉ ሌብል ዊስኪ።',
    price: 38000,
    unit: '750ml Bottle',
    amharicUnit: '750 ሚ.ሊ ጠርሙስ',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pkg-whisky-chivas-12',
    category: 'wine',
    name: 'Chivas Regal 12 Year Blended Scotch',
    amharicName: 'ሺቫስ ሪጋል 12 ዓመት ስኮች ዊስኪ',
    description: 'Smooth and balanced blend of Speyside malts with notes of wild herbs, honey, and ripe orchard fruit.',
    amharicDescription: 'ለስላሳ ጣዕምና ጥሩ መዓዛ ያለው ዝነኛ የ12 ዓመት ሺቫስ ሪጋል ስኮች ዊስኪ።',
    price: 7200,
    unit: '750ml Bottle',
    amharicUnit: '750 ሚ.ሊ ጠርሙስ',
    image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pkg-wine-awash',
    category: 'wine',
    name: 'Awash Axumite / Crystal Wine',
    amharicName: 'አዋሽ አክሱማይት ወይን',
    description: 'Iconic Ethiopian sweet red wine crafted from estate-grown grapes with rich fruit notes.',
    amharicDescription: 'ተወዳጅና ዝነኛ የኢትዮጵያ ጣፋጭ ቀይ ወይን።',
    price: 1200,
    unit: '750ml Bottle',
    amharicUnit: '750 ሚ.ሊ ጠርሙስ',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'pkg-wine-rift',
    category: 'wine',
    name: 'Rift Valley Reserve Merlot / Syrah',
    amharicName: 'ሪፍት ቫሊ ሪዘርቭ ወይን',
    description: 'Premium dry red wine from the volcanic soils of the Great Rift Valley, Ziway.',
    amharicDescription: 'በዝዋይ የሪፍት ቫሊ ለም አፈር ላይ የበቀለ ምርጥ ደረቅ ቀይ ወይን።',
    price: 1850,
    unit: '750ml Bottle',
    amharicUnit: '750 ሚ.ሊ ጠርሙስ',
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'pkg-wine-gouder',
    category: 'wine',
    name: 'Gouder Classic Ethiopian Red',
    amharicName: 'ጉደር ክላሲክ ወይን',
    description: 'Full-bodied traditional dry red wine paired impeccably with spicy stews and kitfo.',
    amharicDescription: 'ለክትፎና ለስጋ ወጥ እጅግ ተስማሚ የሆነ ባህላዊ ደረቅ ቀይ ወይን።',
    price: 1400,
    unit: '750ml Bottle',
    amharicUnit: '750 ሚ.ሊ ጠርሙስ',
    image: 'https://images.unsplash.com/photo-1560512823-829485b8bf24?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'pkg-wine-tej',
    category: 'wine',
    name: 'Pure Highland Honey Tej (2L Flagon)',
    amharicName: 'የማር ጠጅ በብርሌ (2 ሊትር)',
    description: 'Traditional royal Ethiopian honey wine fermented with wild gesho and aged amber honey.',
    amharicDescription: 'ከንጹህ የተፈጥሮ ማርና ከጌሾ የተጠመቀ እውነተኛ ባህላዊ ማር ጠጅ።',
    price: 1100,
    unit: '2 Litre Flagon',
    amharicUnit: '2 ሊትር ማሰሮ',
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&w=800&q=80',
    popular: true
  },

  // ==================== 3. FARM FRESH EGGS ====================
  {
    id: 'pkg-egg-crate',
    category: 'eggs',
    name: 'Fresh Organic Brown Eggs (Full Crate)',
    amharicName: 'ትኩስ የሀገር እንቁላል (ሙሉ ካርቶን - 30 ፍሬ)',
    description: '30 large, free-range pasture-laid brown eggs with vibrant golden yolks for Doro Wat.',
    amharicDescription: 'ለዶሮ ወጥ ድምቀት የሚሆኑ 30 ትኩስ የሀገር እንቁላሎች።',
    price: 900,
    unit: 'Crate (30 pcs)',
    amharicUnit: 'ሙሉ ካርቶን (30 ፍሬ)',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'pkg-egg-half',
    category: 'eggs',
    name: 'Pasture Eggs (Half Crate - 15 pcs)',
    amharicName: 'የጓሮ እንቁላል (ግማሽ ካርቶን - 15 ፍሬ)',
    description: '15 freshly harvested organic eggs packed securely in protective eco-friendly carton.',
    amharicDescription: '15 ትኩስ የጓሮ እንቁላሎች በጥንቃቄ በካርቶን የተዘጋጁ።',
    price: 480,
    unit: 'Half Crate (15 pcs)',
    amharicUnit: 'ግማሽ ካርቶን (15 ፍሬ)',
    image: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=800&q=80'
  },

  // ==================== 4. CELEBRATION FLOWERS ====================
  {
    id: 'pkg-flower-roses',
    category: 'flowers',
    name: 'Luxury Fresh Red Rose Bouquet (12 Stems)',
    amharicName: 'ውብ የቀይ ጽጌረዳ አበባ እቅፍ (12 ፍሬ)',
    description: 'Hand-picked long-stemmed highland roses elegantly wrapped with festive ribbons.',
    amharicDescription: 'በጥንቃቄ የተመረጡ 12 ውብ የቀይ ጽጌረዳ አበቦች በደስታ ሪቫን የታሰሩ።',
    price: 1500,
    unit: '12 Stems Bouquet',
    amharicUnit: '12 ፍሬ እቅፍ',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'pkg-flower-adey',
    category: 'flowers',
    name: 'Festive Adey Abeba Bouquet',
    amharicName: 'የበዓል አደይ አበባና ልዩ የማሳ አበባ እቅፍ',
    description: 'Vibrant yellow Adey Abeba and field daisies symbolizing Ethiopian new beginnings and joy.',
    amharicDescription: 'የበዓል ድምቀትና የደስታ ምልክት የሆኑ ቢጫ አደይ አበቦችና የማሳ አበቦች እቅፍ።',
    price: 1100,
    unit: 'Holiday Arrangement',
    amharicUnit: 'የበዓል እቅፍ',
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=80',
    popular: true
  },
  {
    id: 'pkg-flower-grand',
    category: 'flowers',
    name: 'Grand Celebration Bloom Basket',
    amharicName: 'የተዋበ የበዓል አበባ ቅርጫት',
    description: 'Lush hand-crafted basket with assorted lilies, roses, baby’s breath, and decorative greenery.',
    amharicDescription: 'የተለያዩ አበቦች በጥበብ የተደረደሩበት ለስጦታ የሚሆን ድንቅ የአበባ ቅርጫት።',
    price: 2200,
    unit: 'Celebration Basket',
    amharicUnit: 'የአበባ ቅርጫት',
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
    description: 'Debrebirhan Prime Sheep + Rift Valley Reserve Wine + 1 Crate Organic Fresh Eggs + Luxury Red Rose Bouquet. Free VIP refrigerated delivery included.',
    amharicDescription: 'ደንዳና የደብረ ብርሃን በግ + ሪፍት ቫሊ ወይን + 1 ካርቶን ትኩስ እንቁላል + ውብ የቀይ ጽጌረዳ እቅፍ። ነፃ ማድረሻን ጨምሮ።',
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
    image: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&fm=webp&q=60&w=360&h=160',
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
    image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&fm=webp&q=60&w=360&h=160',
    featured: true,
    totalSlots: 15,
    availableSlots: 15,
    isOutOfStock: false
  },
  {
    id: 'pkg-traditional-goat-tej',
    name: 'Traditional Ginchi Goat & Pure Tej Set',
    amharicName: 'የጊንጪ ፍየልና የማር ጠጅ ጥቅል',
    tagline: 'Authentic Heritage Celebration',
    amharicTagline: 'ባህላዊ የደስታና የድግስ ሙሉ ጥቅል',
    description: 'Prime Ginchi Tender Goat + 2L Traditional Pure Honey Tej + 1 Crate Fresh Eggs (30 pcs). Free delivery & optional slaughter preparation.',
    amharicDescription: 'የጊንጪ ምርጥ ፍየል + 2 ሊትር ንጹህ የማር ጠጅ + 1 ካርቶን እንቁላል (30 ፍሬ)። ነፃ ማድረሻና የዕርድ ዝግጅትን ጨምሮ።',
    categoryCount: 3,
    items: [
      PACKAGE_CATALOG.find(i => i.id === 'pkg-goat-01')!,
      PACKAGE_CATALOG.find(i => i.id === 'pkg-wine-tej')!,
      PACKAGE_CATALOG.find(i => i.id === 'pkg-egg-crate')!
    ],
    originalPrice: 14700,
    packagePrice: 13900,
    savings: 800,
    image: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&fm=webp&q=60&w=360&h=160',
    featured: true,
    totalSlots: 10,
    availableSlots: 8,
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
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&fm=webp&q=60&w=360&h=160',
    featured: true,
    totalSlots: 10,
    availableSlots: 0,
    isOutOfStock: true
  }
];
