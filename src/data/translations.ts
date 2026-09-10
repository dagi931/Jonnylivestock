export type Language = 'en' | 'am';

export interface Translations {
  // Navigation
  nav: {
    home: string;
    sheep: string;
    goats: string;
    cows: string;
    services: string;
    about: string;
    contact: string;
    admin: string;
  };
  // Common Buttons & Labels
  common: {
    browseSheep: string;
    browseGoats: string;
    browseCows: string;
    browseMeat: string;
    viewAllSheep: string;
    viewAllGoats: string;
    viewAllCows: string;
    viewAll: string;
    details: string;
    farmPrice: string;
    contactSeller: string;
    callSeller: string;
    whatsApp: string;
    sendInquiry: string;
    requestReservation: string;
    back: string;
    available: string;
    reserved: string;
    sold: string;
    all: string;
    male: string;
    female: string;
    weight: string;
    location: string;
    breed: string;
    gender: string;
    status: string;
    color: string;
    animalId: string;
    selectedLivestock: string;
    reset: string;
    search: string;
    sortBy: string;
    newestListed: string;
    priceLowHigh: string;
    priceHighLow: string;
    weightLightHeavy: string;
    weightHeavyLight: string;
    allBreeds: string;
    matches: string;
    filterAndSort: string;
    hideFilters: string;
    clearFilters: string;
    priceRange: string;
    weightRange: string;
  };
  // Hero Section
  hero: {
    headlineLine1: string;
    headlineHighlight: string;
    subtext: string;
    valuePoint1: string;
    valuePoint2: string;
    valuePoint3: string;
  };
  // Trust Section (Why Choose Us)
  trust: {
    badge: string;
    title: string;
    description: string;
    card1Title: string;
    card1Desc: string;
    card2Title: string;
    card2Desc: string;
    card3Title: string;
    card3Desc: string;
    card4Title: string;
    card4Desc: string;
  };
  // How It Works
  howItWorks: {
    badge: string;
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
  };
  // Services Section on Home
  servicesOverview: {
    badge: string;
    title: string;
    subtext: string;
    exploreAll: string;
    viewService: string;
  };
  // CTA Section
  cta: {
    badge: string;
    title: string;
    subtext: string;
    callPhone: string;
  };
  // Animal Details Page
  detailsPage: {
    characteristics: string;
    specificationsTitle: string;
    descriptionTitle: string;
    optionalServicesTitle: string;
    optionalServicesSubtitle: string;
    detailsAndFaqs: string;
    contactSellerTitle: string;
    soldNotice: string;
    requestAnimalAndServices: string;
    askQuestionConsultation: string;
    singleOwnerNotice: string;
    otherAvailable: string;
    animalNotFound: string;
    animalNotFoundDesc: string;
  };
  // Services Main Page
  servicesPage: {
    badge: string;
    title: string;
    subtext: string;
    orderMeatByKg: string;
    bookLiveDelivery: string;
    discussWhatsApp: string;
    workflowBadge: string;
    workflowTitle: string;
    hotelConsultationTitle: string;
    hotelConsultationSubtext: string;
  };
  // About Page
  aboutPage: {
    badge: string;
    title: string;
    heroDesc: string;
    differenceTitle: string;
    differenceDesc: string;
    point1Title: string;
    point1Desc: string;
    point2Title: string;
    point2Desc: string;
    point3Title: string;
    point3Desc: string;
    point4Title: string;
    point4Desc: string;
    sheepCardTitle: string;
    sheepCardDesc: string;
    goatCardTitle: string;
    goatCardDesc: string;
    cowCardTitle: string;
    cowCardDesc: string;
    whyChooseTitle: string;
    whyChooseDesc: string;
    trust1Title: string;
    trust1Desc: string;
    trust2Title: string;
    trust2Desc: string;
    trust3Title: string;
    trust3Desc: string;
    trust4Title: string;
    trust4Desc: string;
    ctaLocation: string;
    ctaTitle: string;
    ctaSubtext: string;
    getInTouch: string;
    exploreServices: string;
  };
  // Contact Page
  contactPage: {
    badge: string;
    title: string;
    subtext: string;
    phoneTitle: string;
    phoneDesc: string;
    whatsappTitle: string;
    whatsappDesc: string;
    locationTitle: string;
    hoursTitle: string;
    disclaimer: string;
    formTitle: string;
    formSubtext: string;
    nameLabel: string;
    phoneLabel: string;
    emailLabel: string;
    animalIdLabel: string;
    serviceNeededLabel: string;
    messageLabel: string;
    submitBtn: string;
    submittingBtn: string;
    successTitle: string;
    successDesc: string;
    sendAnotherBtn: string;
  };
  // Footer
  footer: {
    singleOwnerBadge: string;
    quickNavTitle: string;
    directContactTitle: string;
    visitingTitle: string;
    visitingNote: string;
    allRightsReserved: string;
    tagline: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      home: 'Home',
      sheep: 'Sheep',
      goats: 'Goats',
      cows: 'Cattles',
      services: 'Services',
      about: 'About',
      contact: 'Contact',
      admin: 'Admin'
    },
    common: {
      browseSheep: 'Browse Sheep',
      browseGoats: 'Browse Goats',
      browseCows: 'Browse Cattles',
      browseMeat: 'Browse Meat',
      viewAllSheep: 'View All Sheep',
      viewAllGoats: 'View All Goats',
      viewAllCows: 'View All Cattles',
      viewAll: 'View All',
      details: 'Details',
      farmPrice: 'Direct Price',
      contactSeller: 'Contact Seller',
      callSeller: 'Call Seller',
      whatsApp: 'WhatsApp',
      sendInquiry: 'Send Inquiry',
      requestReservation: 'Request Reservation',
      back: 'Back',
      available: 'Available',
      reserved: 'Reserved',
      sold: 'Sold',
      all: 'All',
      male: 'Male',
      female: 'Female',
      weight: 'Weight',
      location: 'Location',
      breed: 'Breed',
      gender: 'Gender',
      status: 'Status',
      color: 'Color',
      animalId: 'Animal ID',
      selectedLivestock: 'Selected Livestock',
      reset: 'Reset',
      search: 'Search',
      sortBy: 'Sort By',
      newestListed: 'Newest Listed',
      priceLowHigh: 'Price: Low to High',
      priceHighLow: 'Price: High to Low',
      weightLightHeavy: 'Weight: Light to Heavy',
      weightHeavyLight: 'Weight: Heavy to Light',
      allBreeds: 'All Breeds',
      matches: 'Matches',
      filterAndSort: 'Filter & Sort',
      hideFilters: 'Hide Filters',
      clearFilters: 'Clear Filters',
      priceRange: 'Price Range (ETB)',
      weightRange: 'Weight Range (kg)'
    },
    hero: {
      headlineLine1: 'Your One-Stop',
      headlineHighlight: 'Livestock Shop',
      subtext: 'Browse our sheep, goats, cattles, and fresh meat, then contact us directly to arrange your order and additional services.',
      valuePoint1: 'Sheep, Goats, Cattles & Prime Meat',
      valuePoint2: 'Exact Scaled Weights',
      valuePoint3: 'Delivery & Slaughter Options'
    },
    trust: {
      badge: 'Why Choose Us',
      title: 'Built on Trust & Simplicity',
      description: 'We eliminate broker markups and guesswork by connecting you directly with our Aware livestock hub. Every sheep, goat, and cattle is health-verified, accurately weighed, and backed by fast doorstep delivery, skilled butchering, and wholesale kitchen meat supply across Addis Ababa.',
      card1Title: 'Quality Animals',
      card1Desc: 'Carefully selected sheep, goats, and cattles with strong physique and healthy development.',
      card2Title: 'Honest Pricing',
      card2Desc: 'Clear and transparent pricing with no hidden broker markups or surprise fees.',
      card3Title: 'Direct Supplier',
      card3Desc: 'Deal directly with the dedicated livestock supplier from initial inquiry to pickup.',
      card4Title: 'Easy Contact',
      card4Desc: 'Reach the supplier quickly by phone or WhatsApp to arrange visits and reservations.'
    },
    howItWorks: {
      badge: 'Simple Process',
      title: 'How It Works',
      subtitle: 'A straightforward way to inspect and secure quality livestock with zero hassle.',
      step1Title: 'Browse',
      step1Desc: 'Explore available sheep, goats, and cattles in our updated catalog with real photos and exact weights.',
      step2Title: 'Choose',
      step2Desc: 'View photos, weight, breed, price, location, and optional video preview to find the right animal.',
      step3Title: 'Contact',
      step3Desc: 'Call or WhatsApp the supplier directly to confirm hold, arrange delivery, or request preparation services.'
    },
    servicesOverview: {
      badge: 'Direct Supply to Kitchen & Table',
      title: 'Meat Supply & Livestock Services',
      subtext: 'Meat by the kg for hotels/restaurants, freshly slaughtered sheep delivery, live transport from Aware, and on-site single-worker butchering.',
      exploreAll: 'Explore All 5 Services',
      viewService: 'View Service'
    },
    cta: {
      badge: 'Direct Livestock Supplier',
      title: 'Looking for Quality Sheep, Goats or Cattles?',
      subtext: 'Browse our available animals and contact us today. We are ready to answer your questions, arrange delivery, and schedule viewing.',
      callPhone: 'Call'
    },
    detailsPage: {
      characteristics: 'Characteristics',
      specificationsTitle: 'Animal Specifications',
      descriptionTitle: 'Description & Temperament',
      optionalServicesTitle: 'Optional Services',
      optionalServicesSubtitle: 'Additional Services for this Animal',
      detailsAndFaqs: 'Details & FAQs',
      contactSellerTitle: 'Contact Seller for this Animal',
      soldNotice: 'This animal has already been sold. Please check our other available listings.',
      requestAnimalAndServices: 'Request Animal & Services',
      askQuestionConsultation: 'Ask a Question / Custom Consultation',
      singleOwnerNotice: 'Direct livestock supplier · Direct phone & in-person pickup',
      otherAvailable: 'Other Available',
      animalNotFound: 'Animal Not Found',
      animalNotFoundDesc: 'The animal ID you requested does not exist or has been removed from our listings.'
    },
    servicesPage: {
      badge: 'Livestock Services & Commercial Supply',
      title: 'Meat in KG, Fresh Slaughter & Livestock Services',
      subtext: 'From wholesale meat in kilograms for hotels & restaurants to freshly slaughtered sheep home delivery, live animal transit from Aware, and on-site dedicated worker butchering.',
      orderMeatByKg: 'Order Meat in KG',
      bookLiveDelivery: 'Book Live Delivery',
      discussWhatsApp: 'Discuss on WhatsApp',
      workflowBadge: 'How It Works',
      workflowTitle: 'Order, Meat Preparation & Delivery Flow',
      hotelConsultationTitle: 'Hotel Meat Supply, Fresh Sheep Delivery & Event Consultation',
      hotelConsultationSubtext: 'We supply sheep, goat & cattle meat by the kg for hotels/caterers, and deliver freshly slaughtered animals directly.'
    },
    aboutPage: {
      badge: 'About Our Livestock Supply',
      title: 'Direct Quality Sheep, Goats, Cattles & Meat Supply Services',
      heroDesc: 'is an independent livestock supplier located in Aware, Addis Ababa. We source, select, and supply prime sheep, goats, and cattles directly to customers, backed by full delivery, handler assistance, and sanitary meat preparation services.',
      differenceTitle: 'The Direct-from-Supplier Difference',
      differenceDesc: 'Unlike confusing multi-vendor marketplaces or middlemen-crowded trading lots, you work directly with the dedicated supplier who manages every animal on site.',
      point1Title: 'Three Primary Livestock Categories',
      point1Desc: 'Handpicked Debrebirhan, Ginchi, Wolayita & Arsi breeds across sheep, goats, and cattle.',
      point2Title: 'Honest Scaled Weights',
      point2Desc: 'Every animal weight is measured accurately on livestock scales prior to listing.',
      point3Title: 'Complete Service Coordination',
      point3Desc: 'Safe delivery vehicles, accompanying handlers, sanitary slaughter, and customized meat portioning.',
      point4Title: 'Personalized Customer Attention',
      point4Desc: 'Direct phone consultations, WhatsApp photo updates, and guided visits.',
      sheepCardTitle: 'Sheep Selection',
      sheepCardDesc: 'High-pasture Debrebirhan, Ginchi, Wolayita, and Arsi sheep with sound health and frames.',
      goatCardTitle: 'Goat Selection',
      goatCardDesc: 'Muscular Debrebirhan, Ginchi, Wolayita, and Arsi goats known for excellent meat yield and high feeding efficiency.',
      cowCardTitle: 'Cattles Selection',
      cowCardDesc: 'Prime Debrebirhan, Ginchi, Wolayita, and Arsi cattles ideal for holiday banquets, breeding, or meat.',
      whyChooseTitle: 'Built on Trust, Livestock Quality & Transparency',
      whyChooseDesc: 'Rooted in animal welfare and straightforward pricing, Jonny Livestock provides a dependable partnership whether you are purchasing a single animal for a holiday feast or securing a high-volume commercial meat supply for hotels and catering kitchens across Addis Ababa.',
      trust1Title: 'Direct Livestock Supplier',
      trust1Desc: 'Deal directly with the dedicated supplier with zero middleman fees or conflicting broker claims.',
      trust2Title: 'Certified Scale Weight',
      trust2Desc: 'Accurate weight documentation and visible health inspections for every animal in our flock.',
      trust3Title: 'Doorstep Transit & Handlers',
      trust3Desc: 'Dedicated transport fleet and trained yard handlers for smooth, stress-free offloading.',
      trust4Title: 'Custom Meat Preparation',
      trust4Desc: 'Precision cuts for Kitfo, Tre Kurt, and Wot prepared under strict sanitary standards.',
      ctaLocation: 'Supplier Location',
      ctaTitle: 'Ready to Select Livestock or Arrange Services?',
      ctaSubtext: 'Contact us directly to discuss your requirements, reserve an animal, or schedule a visit.',
      getInTouch: 'Get in Touch',
      exploreServices: 'Explore Services'
    },
    contactPage: {
      badge: 'Direct Communication',
      title: 'Contact the Seller',
      subtext: 'Have a question about sheep, goats, or cattles, wish to request livestock delivery or slaughter/meat preparation services, or want to schedule a visit? Reach out directly.',
      phoneTitle: 'Direct Phone Line',
      phoneDesc: 'Call directly for immediate inquiries and price confirmation.',
      whatsappTitle: 'WhatsApp Chat',
      whatsappDesc: 'Quick messaging, photos, location pins, and voice notes.',
      locationTitle: 'Supplier Location',
      hoursTitle: 'Business Hours',
      disclaimer: 'No Online Payment Required: Direct seller arrangements. Payment and handover occur upon in-person agreement or verified delivery.',
      formTitle: 'Send a Message',
      formSubtext: 'Inquire about animals or request additional services directly.',
      nameLabel: 'Your Name',
      phoneLabel: 'Phone Number',
      emailLabel: 'Email Address',
      animalIdLabel: 'Animal ID',
      serviceNeededLabel: 'Service Needed',
      messageLabel: 'Message / Inquiry Details',
      submitBtn: 'Send Inquiry to Seller',
      submittingBtn: 'Sending Message...',
      successTitle: 'Message Received',
      successDesc: 'Thank you. Your message has been sent to our team. We will review your inquiry and contact you promptly.',
      sendAnotherBtn: 'Send Another Message'
    },
    footer: {
      singleOwnerBadge: 'Direct Single Owner · Transparent Pricing',
      quickNavTitle: 'Quick Navigation',
      directContactTitle: 'Direct Contact',
      visitingTitle: 'Visiting & Hours',
      visitingNote: 'In-person inspections are welcome. Please contact us before your arrival so we can assist you promptly.',
      allRightsReserved: 'All rights reserved.',
      tagline: 'Direct Livestock Supplier'
    }
  },
  am: {
    nav: {
      home: 'መነሻ',
      sheep: 'በጎች',
      goats: 'ፍየሎች',
      cows: 'ከብቶች',
      services: 'አገልግሎቶች',
      about: 'ስለ እኛ',
      contact: 'ያግኙን',
      admin: 'አድሚን'
    },
    common: {
      browseSheep: 'በጎችን ይመልከቱ',
      browseGoats: 'ፍየሎችን ይመልከቱ',
      browseCows: 'ከብቶችን ይመልከቱ',
      browseMeat: 'ስጋ ይመልከቱ',
      viewAllSheep: 'ሁሉንም በጎች እይ',
      viewAllGoats: 'ሁሉንም ፍየሎች እይ',
      viewAllCows: 'ሁሉንም ከብቶች እይ',
      viewAll: 'ሁሉንም እይ',
      details: 'ዝርዝር',
      farmPrice: 'የአቅራቢ ዋጋ',
      contactSeller: 'ሻጩን ያግኙ',
      callSeller: 'ይደውሉ',
      whatsApp: 'ዋትስአፕ',
      sendInquiry: 'መልእክት ላክ',
      requestReservation: 'ይያዙልኝ / እዘዝ',
      back: 'ተመለስ',
      available: 'ይገኛል',
      reserved: 'ተይዟል',
      sold: 'ተሽጧል',
      all: 'ሁሉም',
      male: 'ተባዕት (አውራ)',
      female: 'አንስት',
      weight: 'ክብደት',
      location: 'ቦታ',
      breed: 'ዝርያ',
      gender: 'ጾታ',
      status: 'ሁኔታ',
      color: 'ቀለም',
      animalId: 'መለያ ቁጥር',
      selectedLivestock: 'የተመረጡ ከብቶች',
      reset: 'አድስ',
      search: 'ፈልግ',
      sortBy: 'አደራድር',
      newestListed: 'አዳዲሶች',
      priceLowHigh: 'ዋጋ፡ ከዝቅተኛ ወደ ከፍተኛ',
      priceHighLow: 'ዋጋ፡ ከከፍተኛ ወደ ዝቅተኛ',
      weightLightHeavy: 'ክብደት፡ ከቀላል ወደ ከባድ',
      weightHeavyLight: 'ክብደት፡ ከከባድ ወደ ቀላል',
      allBreeds: 'ሁሉም ዝርያዎች',
      matches: 'የተገኙት',
      filterAndSort: 'ማጣሪያና ማደራጃ',
      hideFilters: 'ማጣሪያ ደብቅ',
      clearFilters: 'ማጣሪያ አጽዳ',
      priceRange: 'የዋጋ ክልል (ብር)',
      weightRange: 'የክብደት ክልል (ኪሎ)'
    },
    hero: {
      headlineLine1: 'ጆኒ የቀንድ ከብት አቅራቢ',
      headlineHighlight: 'የታመነ የቀንድ ከብትና የበግ አቅራቢ',
      subtext: 'ጥራት ያላቸውን በጎች፣ ፍየሎችና ከብቶች ይመልከቱ፤ በቀጥታ ከጆኒ የቀንድ ከብት አቅራቢ ጋር በመነጋገር ግዢዎንና ተጨማሪ አገልግሎቶችን ያጠናቁ።',
      valuePoint1: 'በጎች፣ ፍየሎች፣ ከብቶችና ስጋ በኪሎ',
      valuePoint2: 'በትክክለኛ ሚዛን የተለኩ',
      valuePoint3: 'የማድረሻና የዕርድ አገልግሎት'
    },
    trust: {
      badge: 'ለምን እኛን ይመርጣሉ?',
      title: 'በእውነተኛ እምነትና ግልጽነት የተገነባ',
      description: 'ያለ ደላላ ጣልቃ ገብነት በቀጥታ ከአዋሬው የከብት አቅራቢ ማዕከላችን ጋር እናገናኝዎታለን። ሁሉም እንስሳ በጤና የተረጋገጠ፣ በሚዛን የተመዘነና አስተማማኝ የማድረሻ፣ የዕርድ እንዲሁም ለሆቴሎች የስጋ አቅርቦት ያለው ነው።',
      card1Title: 'ጥራት ያላቸው እንስሳት',
      card1Desc: 'በጥንቃቄ የተመረጡ ጤነኛና ጠንካራ አካል ያላቸው በጎች፣ ፍየሎችና ሰንጋዎች።',
      card2Title: 'ቀጥተኛና ግልጽ ዋጋ',
      card2Desc: 'ያለ ደላላ ጭማሪ ግልጽና ፍትሃዊ የሆነ የቀጥታ አቅራቢ ዋጋ።',
      card3Title: 'ቀጥተኛ የቀንድ ከብት አቅራቢ',
      card3Desc: 'ከመጀመሪያው ጥያቄ ጀምሮ እስከ ርክክብ ከከብት አቅራቢው ጋር በቀጥታ ይነጋገራሉ።',
      card4Title: 'ቀላልና ፈጣን ግንኙነት',
      card4Desc: 'በስልክ ወይም በዋትስአፕ በፍጥነት በማነጋገር ቦታ ማስያዝና ማዕከሉን መጎብኘት ይችላሉ።'
    },
    howItWorks: {
      badge: 'ቀላል ሂደት',
      title: 'እንዴት ይሰራል?',
      subtitle: 'ያለ ምንም ውጣ ውረድ ጥራት ያላቸውን ከብቶችና በጎች የሚመርጡበት ቀላል መንገድ።',
      step1Title: 'ይመልከቱ',
      step1Desc: 'በእውነተኛ ፎቶና በትክክለኛ ክብደት የቀረቡትን በጎች፣ ፍየሎችና ከብቶች በድረ-ገጻችን ይመልከቱ።',
      step2Title: 'ይምረጡ',
      step2Desc: 'ፎቶውን፣ ክብደቱን፣ ዝርያውን፣ ዋጋውንና ቪዲዮውን በማየት የሚፈልጉትን እንስሳ ይምረጡ።',
      step3Title: 'ያነጋግሩ',
      step3Desc: 'በስልክ ወይም በዋትስአፕ በቀጥታ በመደወል ቦታ ያስይዙ፤ የማድረሻና የዕርድ አገልግሎት ያዝዙ።'
    },
    servicesOverview: {
      badge: 'ከአቅራቢው ወደ ማዕድ',
      title: 'የስጋ አቅርቦትና ተዛማጅ አገልግሎቶች',
      subtext: 'ስጋ በኪሎ ለሆቴሎችና ሬስቶራንቶች፣ የታረደ ትኩስ በግ ማድረስ፣ የቀጥታ ከብት ትራንስፖርትና በቦታው ላይ የዕርድና የስጋ ማዘጋጀት አገልግሎት።',
      exploreAll: 'ሁሉንም 5 አገልግሎቶች እይ',
      viewService: 'አገልግሎቱን እይ'
    },
    cta: {
      badge: 'የቀጥታ የቀንድ ከብት አቅራቢ',
      title: 'ጥራት ያለው በግ፣ ፍየል ወይም ሰንጋ ይፈልጋሉ?',
      subtext: 'ያሉንን እንስሳት ይመልከቱ፤ ዛሬውኑ ያነጋግሩን። ጥያቄዎትን ለመመለስ፣ ማድረሻ ለማመቻቸትና ጉብኝት ለማዘጋጀት ዝግጁ ነን።',
      callPhone: 'ይደውሉ'
    },
    detailsPage: {
      characteristics: 'ልዩ መገለጫዎች',
      specificationsTitle: 'የእንስሳው ሙሉ ዝርዝር መረጃ',
      descriptionTitle: 'መግለጫና ጠባይ',
      optionalServicesTitle: 'ተጨማሪ አገልግሎቶች',
      optionalServicesSubtitle: 'ለዚህ እንስሳ የሚፈልጉትን አገልግሎት ይምረጡ',
      detailsAndFaqs: 'ዝርዝር መረጃና ጥያቄዎች',
      contactSellerTitle: 'ይህን እንስሳ ለመግዛት ሻጩን ያነጋግሩ',
      soldNotice: 'ይህ እንስሳ ተሽጧል። እባክዎ ሌሎች ያሉንን ዝርዝሮች ይመልከቱ።',
      requestAnimalAndServices: 'እንስሳውንና አገልግሎቶችን እዘዝ',
      askQuestionConsultation: 'ጥያቄ ለመጠየቅ / የምክር አገልግሎት',
      singleOwnerNotice: 'ቀጥተኛ የቀንድ ከብት አቅራቢ · በስልክና በአካል ርክክብ',
      otherAvailable: 'ሌሎች የሚገኙ',
      animalNotFound: 'እንስሳው አልተገኘም',
      animalNotFoundDesc: 'የጠየቁት የእንስሳ መለያ ቁጥር አልተገኘም ወይም ከዝርዝር ተሰርዟል።'
    },
    servicesPage: {
      badge: 'የከብትና የስጋ አቅርቦት አገልግሎቶች',
      title: 'ስጋ በኪሎ፣ ትኩስ ዕርድና የከብት አገልግሎቶች',
      subtext: 'ለሆቴሎችና ሬስቶራንቶች ስጋ በኪሎ ከማቅረብ ጀምሮ የታረደ ትኩስ በግ ማድረስ፣ የቀጥታ ትራንስፖርትና ባለሙያ ቀጣሪ የዕርድ አገልግሎት።',
      orderMeatByKg: 'ስጋ በኪሎ እዘዝ',
      bookLiveDelivery: 'የቀጥታ ማድረሻ እዘዝ',
      discussWhatsApp: 'በዋትስአፕ አውራ',
      workflowBadge: 'የአሰራር ሂደት',
      workflowTitle: 'የትዕዛዝ፣ የስጋ ዝግጅትና የማድረሻ ቅደም ተከተል',
      hotelConsultationTitle: 'ለሆቴሎች፣ ለሰርግና ለበዓላት የስጋ አቅርቦት ምክክር',
      hotelConsultationSubtext: 'የበግ፣ የፍየልና የከብት ስጋ በኪሎ ለሆቴሎችና ምግብ ቤቶች እናቀርባለን፤ የታረደ በግም ፈጥነን እናደርሳለን።'
    },
    aboutPage: {
      badge: 'ስለ ድርጅታችን',
      title: 'የታመነ የቀንድ ከብቶች፣ በጎች፣ ፍየሎችና የስጋ አቅራቢ',
      heroDesc: 'በአዲስ አበባ አዋሬ የሚገኝ ራሱን የቻለ የቀንድ ከብትና የበግ አቅራቢ ድርጅት ነው። ምርጥ በጎችን፣ ፍየሎችንና ከብቶችን በቀጥታ ለደንበኞች ያቀርባል፤ ሙሉ የማድረሻና የዕርድ ድጋፍ ይሰጣል።',
      differenceTitle: 'የቀጥታ አቅራቢ ልዩነት',
      differenceDesc: 'ግራ ከሚያጋቡ የደላላ ገበያዎችና አሻሻጮች በተለየ፣ እያንዳንዱን እንስሳ በቀጥታ ከሚያቀርበው አቅራቢ ጋር ይሰራሉ።',
      point1Title: 'ሶስት ዋና ዋና የእንስሳት ዘርፎች',
      point1Desc: 'የደብረ ብርሃን፣ የጊንጪ፣ የወላይታና የአርሲ ዝርያዎች በበግ፣ ፍየልና ሰንጋዎች።',
      point2Title: 'ትክክለኛ የሚዛን ክብደት',
      point2Desc: 'እያንዳንዱ እንስሳ ከመመዝገቡ በፊት በእንስሳት ሚዛን በትክክል ተመዝኖ ይሰየማል።',
      point3Title: 'የተሟላ የአገልግሎት ቅንጅት',
      point3Desc: 'አስተማማኝ የማጓጓዣ ተሽከርካሪዎች፣ ረዳት እረኞች፣ ንጹህ ዕርድና የስጋ መቆራረጥ።',
      point4Title: 'ቀጥተኛ የደንበኛ እንክብካቤ',
      point4Desc: 'የቀጥታ የስልክ ምክክር፣ የዋትስአፕ የፎቶ መረጃዎችና የማዕከሉ ጉብኝት።',
      sheepCardTitle: 'የበጎች ምርጫ',
      sheepCardDesc: 'የደብረ ብርሃን፣ የጊንጪ፣ የወላይታና የአርሲ ምርጥ የበግ ዝርያዎች።',
      goatCardTitle: 'የፍየሎች ምርጫ',
      goatCardDesc: 'ጥሩ የስጋ ምርት የሚሰጡ የደብረ ብርሃን፣ የጊንጪ፣ የወላይታና የአርሲ ፍየሎች።',
      cowCardTitle: 'የከብቶችና ሰንጋዎች ምርጫ',
      cowCardDesc: 'ለበዓል ድግስና ለስጋ ንግድ የሚሆኑ የደብረ ብርሃን፣ የጊንጪ፣ የወላይታና የአርሲ ምርጥ ሰንጋዎች።',
      whyChooseTitle: 'በእምነት፣ በእንስሳት ጤናና በግልጽነት የተገነባ',
      whyChooseDesc: 'ለበዓል ድግስ አንድ እንስሳ ቢገዙ ወይም ለሆቴልና ሬስቶራንት ቀጣይነት ያለው ከፍተኛ የስጋ አቅርቦት ቢፈልጉ፣ ጆኒ የቀንድ ከብት አቅራቢ አስተማማኝ አጋርዎ ነው።',
      trust1Title: 'የቀጥታ ከብት አቅራቢ',
      trust1Desc: 'ያለ ደላላ ኮሚሽንና ጭማሪ በቀጥታ ከአቅራቢው ጋር ይገበያዩ።',
      trust2Title: 'የተረጋገጠ የሚዛን ክብደት',
      trust2Desc: 'ትክክለኛ የክብደት ሰነድና የጤና ምርመራ የተደረገላቸው እንስሳት።',
      trust3Title: 'እስከ ደጃፍ ማድረሻና አስረካቢዎች',
      trust3Desc: 'የተዘጋጁ ተሽከርካሪዎችና እንስሳቱን በጥንቃቄ የሚያስረክቡ እረኞች።',
      trust4Title: 'ልዩ የስጋ ዝግጅት',
      trust4Desc: 'ለክትፎ፣ ለጥሬ ቁርጥ እና ለወጥ የሚሆን ስጋ በንጽህና ይዘጋጃል።',
      ctaLocation: 'የአቅራቢው አድራሻ',
      ctaTitle: 'ከብት ለመምረጥ ወይም አገልግሎት ለማዘዝ ዝግጁ ኖት?',
      ctaSubtext: 'ፍላጎትዎትን ለመወያየት፣ እንስሳ ለማስያዝ ወይም ማዕከላችንን ለመጎብኘት በቀጥታ ያነጋግሩን።',
      getInTouch: 'ያግኙን',
      exploreServices: 'አገልግሎቶችን እይ'
    },
    contactPage: {
      badge: 'የቀጥታ ግንኙነት',
      title: 'ሻጩን ያነጋግሩ',
      subtext: 'ስለ በጎች፣ ፍየሎች ወይም ከብቶች ጥያቄ ካለዎት፣ የማድረሻና የዕርድ አገልግሎት ለማዘዝ ወይም ማዕከላችንን ለመጎብኘት በቀጥታ ያግኙን።',
      phoneTitle: 'የቀጥታ ስልክ መስመር',
      phoneDesc: 'ለአስቸኳይ ጥያቄና ዋጋ ማረጋገጫ በቀጥታ ይደውሉ።',
      whatsappTitle: 'የዋትስአፕ መልእክት',
      whatsappDesc: 'ፈጣን መልእክት፣ ፎቶዎች፣ የቦታ አድራሻና የድምፅ መልእክት ለመላክ።',
      locationTitle: 'የአቅራቢው ቦታ',
      hoursTitle: 'የስራ ሰዓት',
      disclaimer: 'የቅድሚያ ክፍያ አያስፈልግም፡ ቀጥተኛ የሻጭና ገዢ ስምምነት። ክፍያ የሚፈጸመው በአካል ሲረከቡ ወይም ማድረሻ ሲደርስ ነው።',
      formTitle: 'መልእክት ይላኩ',
      formSubtext: 'ስለ እንስሳቱ ይጠይቁ ወይም ተጨማሪ አገልግሎት በቀጥታ ይዘዙ።',
      nameLabel: 'ሙሉ ስም',
      phoneLabel: 'ስልክ ቁጥር',
      emailLabel: 'ኢሜይል',
      animalIdLabel: 'የእንስሳው መለያ ቁጥር',
      serviceNeededLabel: 'የሚፈልጉት አገልግሎት',
      messageLabel: 'መልእክት / የትዕዛዝ ዝርዝር',
      submitBtn: 'መልእክት ለሻጩ ላክ',
      submittingBtn: 'በመላክ ላይ...',
      successTitle: 'መልእክትዎ ደርሶናል',
      successDesc: 'እናመሰግናለን። መልእክትዎ ደርሶናል፤ በአጭር ጊዜ ውስጥ በስልክ ቁጥርዎ እንደውላለን።',
      sendAnotherBtn: 'ሌላ መልእክት ላክ'
    },
    footer: {
      singleOwnerBadge: 'የቀጥታ ከብት አቅራቢ · ግልጽና ትክክለኛ ዋጋ',
      quickNavTitle: 'ፈጣን ማውጫ',
      directContactTitle: 'ቀጥተኛ አድራሻ',
      visitingTitle: 'ጉብኝትና የስራ ሰዓት',
      visitingNote: 'በአካል መጥተው መጎብኘት ይችላሉ። በአግባቡ እንድንቀበልዎ እባክዎ ከመምጣትዎ በፊት በስልክ ያሳውቁን።',
      allRightsReserved: 'መብቱ በህግ የተጠበቀ ነው።',
      tagline: 'የቀንድ ከብትና የበግ አቅራቢ'
    }
  }
};
