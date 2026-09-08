export interface AddisLocation {
  id: string;
  name: string;
  amharicName: string;
  subCity: string;
  amharicSubCity: string;
  lat: number;
  lng: number;
  category?: 'hotel' | 'hospital' | 'mall' | 'landmark' | 'area';
  popular?: boolean;
}

export const AWARE_FARM_LOCATION = {
  name: 'Jonny Livestock Main Facility (Seller Location)',
  amharicName: 'ጆኒ የቀንድ ከብት አቅራቢ ዋና ተቋም (የሻጭ መገኛ)',
  address: 'Arat Kilo / Belay Zeleke Street, Addis Ababa',
  lat: 9.0314,
  lng: 38.7725
};

export const ADDIS_ABABA_LOCATIONS: AddisLocation[] = [
  // ==================== TOP HOTELS & RESORTS ====================
  {
    id: 'skylight-hotel',
    name: 'Ethiopian Skylight Hotel',
    amharicName: 'የኢትዮጵያ ስካይላይት ሆቴል',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 8.9886,
    lng: 38.7954,
    category: 'hotel',
    popular: true
  },
  {
    id: 'hilton-hotel',
    name: 'Hilton Addis Ababa',
    amharicName: 'ሒልተን ሆቴል አዲስ አበባ',
    subCity: 'Kirkos',
    amharicSubCity: 'ቂርቆስ',
    lat: 9.0189,
    lng: 38.7629,
    category: 'hotel',
    popular: true
  },
  {
    id: 'sheraton-addis',
    name: 'Sheraton Addis (Luxury Collection)',
    amharicName: 'ሼራተን አዲስ ሆቴል',
    subCity: 'Kirkos',
    amharicSubCity: 'ቂርቆስ',
    lat: 9.0195,
    lng: 38.7584,
    category: 'hotel',
    popular: true
  },
  {
    id: 'radisson-blu',
    name: 'Radisson Blu Hotel',
    amharicName: 'ራዲሰን ብሉ ሆቴል',
    subCity: 'Kirkos',
    amharicSubCity: 'ቂርቆስ',
    lat: 9.0163,
    lng: 38.7675,
    category: 'hotel',
    popular: true
  },
  {
    id: 'hyatt-regency',
    name: 'Hyatt Regency Addis Ababa',
    amharicName: 'ሀያት ሪጀንሲ ሆቴል (መስቀል አደባባይ)',
    subCity: 'Kirkos',
    amharicSubCity: 'ቂርቆስ',
    lat: 9.0118,
    lng: 38.7634,
    category: 'hotel',
    popular: true
  },
  {
    id: 'jupiter-bole',
    name: 'Jupiter International Hotel (Bole)',
    amharicName: 'ጁፒተር ሆቴል (ቦሌ)',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 8.9958,
    lng: 38.7850,
    category: 'hotel',
    popular: true
  },
  {
    id: 'jupiter-kazanchis',
    name: 'Jupiter International Hotel (Kazanchis)',
    amharicName: 'ጁፒተር ሆቴል (ካዛንቺስ)',
    subCity: 'Kirkos',
    amharicSubCity: 'ቂርቆስ',
    lat: 9.0178,
    lng: 38.7702,
    category: 'hotel',
    popular: true
  },
  {
    id: 'sapphire-addis',
    name: 'Sapphire Addis Hotel (Bole Atlas)',
    amharicName: 'ሳፋየር አዲስ ሆቴል (ቦሌ አትላስ)',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 9.0068,
    lng: 38.7842,
    category: 'hotel',
    popular: true
  },
  {
    id: 'inter-luxury',
    name: 'Inter Luxury Hotel (Intercontinental)',
    amharicName: 'ኢንተር ሌግዠሪ ሆቴል (ካዛንቺስ)',
    subCity: 'Kirkos',
    amharicSubCity: 'ቂርቆስ',
    lat: 9.0169,
    lng: 38.7686,
    category: 'hotel',
    popular: true
  },
  {
    id: 'capital-hotel',
    name: 'Capital Hotel and Spa (22 Mazoria)',
    amharicName: 'ካፒታል ሆቴል እና ስፓ (22 ማዞሪያ)',
    subCity: 'Yeka',
    amharicSubCity: 'የካ',
    lat: 9.0152,
    lng: 38.7855,
    category: 'hotel',
    popular: true
  },
  {
    id: 'golden-tulip',
    name: 'Golden Tulip Addis Ababa',
    amharicName: 'ጎልደን ቱሊፕ ሆቴል (ቦሌ ሜድሃኒዓለም)',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 8.9961,
    lng: 38.7885,
    category: 'hotel',
    popular: true
  },
  {
    id: 'elilly-hotel',
    name: 'Elilly International Hotel',
    amharicName: 'ኤሊሊ ኢንተርናሽናል ሆቴል (ካዛንቺስ)',
    subCity: 'Kirkos',
    amharicSubCity: 'ቂርቆስ',
    lat: 9.0155,
    lng: 38.7698,
    category: 'hotel',
    popular: true
  },
  {
    id: 'best-western-plus',
    name: 'Best Western Plus Addis Ababa',
    amharicName: 'ቤስት ዌስተርን ፕላስ ሆቴል (ቦሌ)',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 8.9972,
    lng: 38.7865,
    category: 'hotel',
    popular: true
  },
  {
    id: 'harmony-hotel',
    name: 'Harmony Hotel (Bole Medhanialem)',
    amharicName: 'ሀርሞኒ ሆቴል (ቦሌ መድኃኒዓለም)',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 8.9982,
    lng: 38.7880,
    category: 'hotel',
    popular: true
  },
  {
    id: 'monarch-hotel',
    name: 'Monarch Hotel (Bole Atlas)',
    amharicName: 'ሞናርክ ሆቴል (ቦሌ አትላስ)',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 9.0082,
    lng: 38.7836,
    category: 'hotel',
    popular: true
  },
  {
    id: 'ramada-wyndham',
    name: 'Ramada by Wyndham Addis Ababa',
    amharicName: 'ራማዳ ሆቴል (ቦሌ መንገድ)',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 8.9928,
    lng: 38.7818,
    category: 'hotel',
    popular: true
  },
  {
    id: 'nexus-hotel',
    name: 'Nexus Hotel (Gerji)',
    amharicName: 'ኔክሰስ ሆቴል (ገርጂ)',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 8.9995,
    lng: 38.8145,
    category: 'hotel',
    popular: true
  },
  {
    id: 'caravan-hotel',
    name: 'Caravan Hotel (22 Mazoria)',
    amharicName: 'ካራቫን ሆቴል (22 ማዞሪያ)',
    subCity: 'Yeka',
    amharicSubCity: 'የካ',
    lat: 9.0142,
    lng: 38.7872,
    category: 'hotel',
    popular: true
  },
  {
    id: 'grand-palace-hotel',
    name: 'Grand Palace Hotel (Kazanchis / Guinea Conakry)',
    amharicName: 'ግራንድ ፓላስ ሆቴል (ካዛንቺስ)',
    subCity: 'Kirkos',
    amharicSubCity: 'ቂርቆስ',
    lat: 9.0148,
    lng: 38.7668,
    category: 'hotel',
    popular: true
  },
  {
    id: 'ghion-hotel',
    name: 'Ghion Hotel (Meskel Square)',
    amharicName: 'ጊዮን ሆቴል (መስቀል አደባባይ)',
    subCity: 'Kirkos',
    amharicSubCity: 'ቂርቆስ',
    lat: 9.0135,
    lng: 38.7595,
    category: 'hotel'
  },
  {
    id: 'taytu-hotel',
    name: 'Itegue Taitu Hotel (Piassa)',
    amharicName: 'እቴጌ ጣይቱ ሆቴል (ፒያሳ)',
    subCity: 'Arada',
    amharicSubCity: 'አራዳ',
    lat: 9.0345,
    lng: 38.7512,
    category: 'hotel'
  },
  {
    id: 'getfam-hotel',
    name: 'Getfam Hotel (22 Mazoria)',
    amharicName: 'ጌትፋም ሆቴል (22 ማዞሪያ)',
    subCity: 'Yeka',
    amharicSubCity: 'የካ',
    lat: 9.0160,
    lng: 38.7890,
    category: 'hotel'
  },
  {
    id: 'dreamliner-hotel',
    name: 'Dreamliner Hotel (Meskel Flower)',
    amharicName: 'ድሪምላይነር ሆቴል (መስቀል ፍላወር)',
    subCity: 'Kirkos',
    amharicSubCity: 'ቂርቆስ',
    lat: 8.9965,
    lng: 38.7580,
    category: 'hotel'
  },

  // ==================== SHOPPING MALLS & PLAZAS ====================
  {
    id: 'edna-mall',
    name: 'Edna Mall (Bole Medhanialem)',
    amharicName: 'ኤድና ሞል (ቦሌ መድኃኒዓለም)',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 8.9984,
    lng: 38.7877,
    category: 'mall',
    popular: true
  },
  {
    id: 'dembel-city-center',
    name: 'Dembel City Center (Olympia / Bole Rd)',
    amharicName: 'ደምበል ሲቲ ሴንተር (ኦሎምፒያ / ቦሌ መንገድ)',
    subCity: 'Kirkos',
    amharicSubCity: 'ቂርቆስ',
    lat: 9.0040,
    lng: 38.7670,
    category: 'mall',
    popular: true
  },
  {
    id: 'century-mall',
    name: 'Century Mall (Gurd Shola)',
    amharicName: 'ሴንቸሪ ሞል (ጉርድ ሾላ)',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 9.0208,
    lng: 38.8140,
    category: 'mall',
    popular: true
  },
  {
    id: 'zefmesh-mall',
    name: 'Zefmesh Grand Mall (Megenagna)',
    amharicName: 'ዘፍመሽ ግራንድ ሞል (መገናኛ)',
    subCity: 'Yeka',
    amharicSubCity: 'የካ',
    lat: 9.0202,
    lng: 38.8015,
    category: 'mall',
    popular: true
  },
  {
    id: 'morning-star-mall',
    name: 'Morning Star Mall (Bole Medhanialem)',
    amharicName: 'ሞርኒንግ ስታር ሞል (ቦሌ መድኃኒዓለም)',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 8.9992,
    lng: 38.7860,
    category: 'mall',
    popular: true
  },
  {
    id: 'friendship-center',
    name: 'Friendship Business Center (Bole Road)',
    amharicName: 'ፍሬንድሺፕ ቢዝነስ ሴንተር (ቦሌ መንገድ)',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 8.9942,
    lng: 38.7825,
    category: 'mall',
    popular: true
  },
  {
    id: 'getu-commercial',
    name: 'Getu Commercial Center (Bole / Atlas)',
    amharicName: 'ጌቱ ኮሜርሻል ሴንተር (ቦሌ መንገድ)',
    subCity: 'Kirkos',
    amharicSubCity: 'ቂርቆስ',
    lat: 9.0022,
    lng: 38.7725,
    category: 'mall'
  },
  {
    id: 'adams-pavilion',
    name: 'Adams Pavilion (Sarbet)',
    amharicName: 'አዳምስ ፓቪሊዮን (ሳርቤት)',
    subCity: 'Kirkos',
    amharicSubCity: 'ቂርቆስ',
    lat: 8.9960,
    lng: 38.7410,
    category: 'mall'
  },

  // ==================== HOSPITALS & MEDICAL CENTERS ====================
  {
    id: 'tikur-anbessa',
    name: 'Tikur Anbessa (Black Lion) Hospital',
    amharicName: 'ጥቁር አንበሳ ሆስፒታል (ልደታ)',
    subCity: 'Lideta',
    amharicSubCity: 'ልደታ',
    lat: 9.0185,
    lng: 38.7495,
    category: 'hospital',
    popular: true
  },
  {
    id: 'st-pauls-hospital',
    name: "St. Paul's Hospital Millennium Medical College",
    amharicName: 'ቅዱስ ጳውሎስ ሆስፒታል (ጉለሌ)',
    subCity: 'Gulele',
    amharicSubCity: 'ጉለሌ',
    lat: 9.0620,
    lng: 38.7310,
    category: 'hospital',
    popular: true
  },
  {
    id: 'korean-hospital-mcm',
    name: 'Korean Hospital / MCM General Hospital (Gerji)',
    amharicName: 'ኮሪያ ሆስፒታል / ኤምሲኤም (ገርጂ)',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 8.9895,
    lng: 38.8185,
    category: 'hospital',
    popular: true
  },
  {
    id: 'kadisco-hospital',
    name: 'Kadisco General Hospital (Gerji)',
    amharicName: 'ካዲኮ አጠቃላይ ሆስፒታል (ገርጂ)',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 8.9950,
    lng: 38.8105,
    category: 'hospital',
    popular: true
  },
  {
    id: 'brass-hospital',
    name: 'Brass Maternal & Child Hospital (Bole Atlas)',
    amharicName: 'ብራስ ሆስፒታል (ቦሌ አትላስ)',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 9.0089,
    lng: 38.7844,
    category: 'hospital',
    popular: true
  },
  {
    id: 'landmark-hospital',
    name: 'Landmark General Hospital (Meshualekia / Mexico)',
    amharicName: 'ላንድማርክ ሆስፒታል (መሸዋለኪያ / ሜክሲኮ)',
    subCity: 'Kirkos',
    amharicSubCity: 'ቂርቆስ',
    lat: 9.0075,
    lng: 38.7525,
    category: 'hospital',
    popular: true
  },
  {
    id: 'bethzatha-hospital',
    name: 'Bethzatha General Hospital (Stadium)',
    amharicName: 'ቤተዛታ ሆስፒታል (ስታዲየም አካባቢ)',
    subCity: 'Kirkos',
    amharicSubCity: 'ቂርቆስ',
    lat: 9.0125,
    lng: 38.7540,
    category: 'hospital',
    popular: true
  },
  {
    id: 'yekatit-12-hospital',
    name: 'Yekatit 12 Hospital (Arat Kilo)',
    amharicName: 'የካቲት 12 ሆስፒታል (አራት ኪሎ)',
    subCity: 'Arada',
    amharicSubCity: 'አራዳ',
    lat: 9.0350,
    lng: 38.7615,
    category: 'hospital'
  },
  {
    id: 'hayat-hospital',
    name: 'Hayat Hospital (Bole)',
    amharicName: 'ሀያት ሆስፒታል (ቦሌ)',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 9.0010,
    lng: 38.7915,
    category: 'hospital'
  },
  {
    id: 'tor-hailoch-hospital',
    name: 'Armed Forces General Hospital (Tor Hailoch)',
    amharicName: 'ጦር ኃይሎች አጠቃላይ ሆስፒታል',
    subCity: 'Lideta',
    amharicSubCity: 'ልደታ',
    lat: 9.0090,
    lng: 38.7210,
    category: 'hospital'
  },

  // ==================== POPULAR SUB-CITIES, SQUARES & NEIGHBORHOODS ====================
  {
    id: 'aware',
    name: 'Aware (Livestock Center Vicinity / Ministry of Education)',
    amharicName: 'አዋሬ (የማዕከሉ አካባቢ / ትምህርት ሚኒስቴር)',
    subCity: 'Yeka',
    amharicSubCity: 'የካ',
    lat: 9.0182,
    lng: 38.7750,
    category: 'area',
    popular: true
  },
  {
    id: 'kazanchis',
    name: 'Kazanchis / UNECA Area',
    amharicName: 'ካዛንቺስ / ኢካ አካባቢ',
    subCity: 'Kirkos',
    amharicSubCity: 'ቂርቆስ',
    lat: 9.0175,
    lng: 38.7690,
    category: 'area',
    popular: true
  },
  {
    id: 'meskel-square',
    name: 'Meskel Square (Addis Ababa City Center)',
    amharicName: 'መስቀል አደባባይ',
    subCity: 'Kirkos',
    amharicSubCity: 'ቂርቆስ',
    lat: 9.0105,
    lng: 38.7630,
    category: 'landmark',
    popular: true
  },
  {
    id: 'bole-medhanialem',
    name: 'Bole Medhanialem Cathedral Area',
    amharicName: 'ቦሌ መድሃኒዓለም ካቴድራል አካባቢ',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 8.9984,
    lng: 38.7877,
    category: 'area',
    popular: true
  },
  {
    id: 'bole-atlas',
    name: 'Bole Atlas / Namibia Street',
    amharicName: 'ቦሌ አትላስ / ናሚቢያ ጎዳና',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 9.0089,
    lng: 38.7844,
    category: 'area',
    popular: true
  },
  {
    id: 'bole-rwanda',
    name: 'Bole Rwanda / Japan Embassy Area',
    amharicName: 'ቦሌ ሩዋንዳ / ጃፓን ኤምባሲ አካባቢ',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 8.9890,
    lng: 38.7760,
    category: 'area',
    popular: true
  },
  {
    id: 'bole-bulbula',
    name: 'Bole Bulbula / Mariam Sefer / 93 Mazoria',
    amharicName: 'ቦሌ ቡልቡላ / ማርያም ሰፈር / 93 ማዞሪያ',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 8.9567,
    lng: 38.7890,
    category: 'area',
    popular: true
  },
  {
    id: 'hayahulet',
    name: 'Hayahulet Mazoria (22 Mazoria / Golagol)',
    amharicName: '22 ማዞሪያ / ጎላጎል / ኃይሌ ገብረስላሴ ጎዳና',
    subCity: 'Yeka',
    amharicSubCity: 'የካ',
    lat: 9.0150,
    lng: 38.7860,
    category: 'area',
    popular: true
  },
  {
    id: 'megenagna',
    name: 'Megenagna / Lem Hotel / Diaspora Square',
    amharicName: 'መገናኛ / ሌም ሆቴል / ዲያስፖራ አደባባይ',
    subCity: 'Yeka',
    amharicSubCity: 'የካ',
    lat: 9.0205,
    lng: 38.8020,
    category: 'area',
    popular: true
  },
  {
    id: 'gurd-shola',
    name: 'Gurd Shola / Salite Mihret Church',
    amharicName: 'ጉርድ ሾላ / ጸሎተ ምህረት ቤተክርስቲያን',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 9.0210,
    lng: 38.8150,
    category: 'area',
    popular: true
  },
  {
    id: 'cmc',
    name: 'CMC / Michael Roundabout / Tsehay Real Estate',
    amharicName: 'ሲኤምሲ / ሚካኤል አደባባይ / ፀሀይ ሪል እስቴት',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 9.0220,
    lng: 38.8350,
    category: 'area',
    popular: true
  },
  {
    id: 'ayat',
    name: 'Ayat / Zone 1 to 8 / Tafo Road',
    amharicName: 'አያት / ዞን 1-8 / ጣፎ መንገድ',
    subCity: 'Yeka',
    amharicSubCity: 'የካ',
    lat: 9.0240,
    lng: 38.8650,
    category: 'area',
    popular: true
  },
  {
    id: 'summit',
    name: 'Summit / Safari / Condominium / Fiyel Bet',
    amharicName: 'ሰሚት / ሳፋሪ / ኮንዶሚኒየም / ፍየል ቤት',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 9.0060,
    lng: 38.8600,
    category: 'area',
    popular: true
  },
  {
    id: 'gerji',
    name: 'Gerji / Roba Bakery / Imperial Roundabout',
    amharicName: 'ገርጂ / ሮባ ዳቦ / ኢምፔሪያል አደባባይ',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 8.9930,
    lng: 38.8120,
    category: 'area',
    popular: true
  },
  {
    id: 'sarbet',
    name: 'Sarbet / Pushkin Square / Old Airport / ICS',
    amharicName: 'ሳርቤት / ፑሽኪን አደባባይ / ብሉ በርድ / አይ ሲ ኤስ',
    subCity: 'Kirkos',
    amharicSubCity: 'ቂርቆስ',
    lat: 8.9950,
    lng: 38.7420,
    category: 'area',
    popular: true
  },
  {
    id: 'gotera',
    name: 'Gotera / Meskel Flower / Olympia Roundabout',
    amharicName: 'ጎተራ / መስቀል ፍላወር / ኦሎምፒያ',
    subCity: 'Kirkos',
    amharicSubCity: 'ቂርቆስ',
    lat: 8.9970,
    lng: 38.7620,
    category: 'area',
    popular: true
  },
  {
    id: 'mexico',
    name: 'Mexico Square / Kera / Addis Ababa University Commerce',
    amharicName: 'ሜክሲኮ አደባባይ / ቄራ / ንግድ ስራ ኮሌጅ',
    subCity: 'Kirkos',
    amharicSubCity: 'ቂርቆስ',
    lat: 9.0105,
    lng: 38.7460,
    category: 'area',
    popular: true
  },
  {
    id: 'piassa',
    name: 'Piassa / Churchill Road / De Gaulle Square',
    amharicName: 'ፒያሳ / ቸርችል ጎዳና / ዴጎል አደባባይ',
    subCity: 'Arada',
    amharicSubCity: 'አራዳ',
    lat: 9.0340,
    lng: 38.7520,
    category: 'area',
    popular: true
  },
  {
    id: 'arat-kilo',
    name: 'Arat Kilo / Parliament / Grand Palace / Unity Park',
    amharicName: 'አራት ኪሎ / ፓርላማ / ቤተመንግስት / አንድነት ፓርክ',
    subCity: 'Arada',
    amharicSubCity: 'አራዳ',
    lat: 9.0335,
    lng: 38.7635,
    category: 'landmark',
    popular: true
  },
  {
    id: 'sidist-kilo',
    name: 'Sidist Kilo / AAU Main Campus / Yekatit 12 Square',
    amharicName: 'ስድስት ኪሎ / ዩኒቨርሲቲ ዋናው ግቢ',
    subCity: 'Yeka',
    amharicSubCity: 'የካ',
    lat: 9.0490,
    lng: 38.7610,
    category: 'landmark',
    popular: true
  },
  {
    id: 'tor-hailoch',
    name: 'Tor Hailoch / Total / Old Post Office',
    amharicName: 'ጦር ኃይሎች / ቶታል / የድሮ ፖስታ ቤት',
    subCity: 'Lideta',
    amharicSubCity: 'ልደታ',
    lat: 9.0100,
    lng: 38.7200,
    category: 'area',
    popular: true
  },
  {
    id: 'lebu',
    name: 'Lebu / Mebrat Hayl / Varnero / Musika Sefer',
    amharicName: 'ለቡ / መብራት ኃይል / ቫርኔሮ / ሙዚቃ ሰፈር',
    subCity: 'Nifas Silk',
    amharicSubCity: 'ንፋስ ስልክ',
    lat: 8.9550,
    lng: 38.7230,
    category: 'area',
    popular: true
  },
  {
    id: 'jemo-1',
    name: 'Jemo 1 & 2 / Glass Factory Condominiums',
    amharicName: 'ጀሞ 1 እና 2 / ብርጭቆ ፋብሪካ ኮንዶሚኒየም',
    subCity: 'Nifas Silk',
    amharicSubCity: 'ንፋስ ስልክ',
    lat: 8.9420,
    lng: 38.7050,
    category: 'area',
    popular: true
  },
  {
    id: 'jemo-3',
    name: 'Jemo 3 / Michael Church Roundabout',
    amharicName: 'ጀሞ 3 / ሚካኤል አደባባይ',
    subCity: 'Nifas Silk',
    amharicSubCity: 'ንፋስ ስልክ',
    lat: 8.9310,
    lng: 38.6940,
    category: 'area'
  },
  {
    id: 'bisrate-gabriel',
    name: 'Bisrate Gabriel / Lafto Mall / Vatican Embassy Area',
    amharicName: 'ብስራተ ገብርኤል / ላፍቶ ሞል / ቫቲካን ኤምባሲ',
    subCity: 'Nifas Silk',
    amharicSubCity: 'ንፋስ ስልክ',
    lat: 8.9810,
    lng: 38.7320,
    category: 'area',
    popular: true
  },
  {
    id: 'kotebe',
    name: 'Kotebe / Hana Mariam / Metal Factory',
    amharicName: 'ኮተቤ / ሃና ማርያም / ብረታብረት',
    subCity: 'Yeka',
    amharicSubCity: 'የካ',
    lat: 9.0430,
    lng: 38.8350,
    category: 'area'
  },
  {
    id: 'kolfe',
    name: 'Kolfe / 18 Mazoria / Keranio',
    amharicName: 'ኮልፌ / 18 ማዞሪያ / ቄራኒዮ',
    subCity: 'Kolfe Keranio',
    amharicSubCity: 'ኮልፌ ቄራኒዮ',
    lat: 9.0280,
    lng: 38.7080,
    category: 'area'
  },
  {
    id: 'bethel',
    name: 'Bethel / Total Roundabout / Hospital',
    amharicName: 'ቤቴል / ቶታል አደባባይ / ሆስፒታል',
    subCity: 'Kolfe Keranio',
    amharicSubCity: 'ኮልፌ ቄራኒዮ',
    lat: 9.0030,
    lng: 38.6850,
    category: 'area'
  },
  {
    id: 'lafto',
    name: 'Lafto / Gofa Camp / German Square',
    amharicName: 'ላፍቶ / ጎፋ ካምፕ / ጀርመን አደባባይ',
    subCity: 'Nifas Silk',
    amharicSubCity: 'ንፋስ ስልክ',
    lat: 8.9750,
    lng: 38.7450,
    category: 'area'
  },
  {
    id: 'akaki-kaliti',
    name: 'Akaki Kaliti / Kality Customs / Gelan Condominium',
    amharicName: 'አቃቂ ቃሊቲ / ጉምሩክ / ገላን ኮንዶሚኒየም',
    subCity: 'Akaki Kality',
    amharicSubCity: 'አቃቂ ቃሊቲ',
    lat: 8.8950,
    lng: 38.7650,
    category: 'area'
  },
  {
    id: 'merkato',
    name: 'Merkato (Military Tera / Sebategna / Anwar Mosque)',
    amharicName: 'መርካቶ / ሚሊተሪ ተራ / ሰባተኛ / አንዋር መስጊድ',
    subCity: 'Addis Ketema',
    amharicSubCity: 'አዲስ ከተማ',
    lat: 9.0300,
    lng: 38.7390,
    category: 'landmark',
    popular: true
  },
  {
    id: 'bole-airport',
    name: 'Addis Ababa Bole International Airport (ADD)',
    amharicName: 'ቦሌ ዓለም አቀፍ አውሮፕላን ማረፊያ',
    subCity: 'Bole',
    amharicSubCity: 'ቦሌ',
    lat: 8.9778,
    lng: 38.7993,
    category: 'landmark',
    popular: true
  }
];
