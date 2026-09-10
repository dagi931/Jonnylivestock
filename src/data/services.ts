import { ServiceItem } from '../types/service';

export interface MealPurposeOption {
  id: string;
  name: string;
  amharicName: string;
  description: string;
  pricePerKg: number;
}

export const ethiopianMealPurposes: MealPurposeOption[] = [
  {
    id: 'kurt',
    name: 'Tre Kurt / Tere Siga',
    amharicName: 'ጥሬ ቁርጥ',
    description: 'Prime, tender, fresh raw meat cuts selected from best portions of oxen.',
    pricePerKg: 2800
  },
  {
    id: 'kitfo',
    name: 'Kitfo',
    amharicName: 'ክትፎ',
    description: 'Extra-lean, finely trimmed red beef free from sinew and fat.',
    pricePerKg: 2200
  },
  {
    id: 'wot',
    name: 'Wot (Key / Alicha)',
    amharicName: 'ወጥ',
    description: 'Bite-sized stew portions perfect for Key Wot, Alicha, or Minchet.',
    pricePerKg: 1800
  }
];

export const livestockServices: ServiceItem[] = [
  {
    id: 'delivery',
    title: 'Live Livestock Delivery',
    shortDescription: 'Safe, coordinated transportation of your purchased live sheep, goat or cattle from Aware, Addis Ababa to your destination.',
    fullDescription: 'We arrange secure and timely transportation for purchased live animals directly from our Aware facility in Addis Ababa to your residence, event venue, or business. Vehicles are equipped for gentle animal transit with direct arrival coordination.',
    iconName: 'Truck',
    highlights: [
      'Direct delivery from Aware, Addis Ababa',
      'Secure, gentle animal transport vehicle',
      'Timely destination coordination & offloading',
      'Delivery fee based on destination distance'
    ],
    ctaLabel: 'Request Live Delivery'
  },
  {
    id: 'slaughter-prep',
    title: 'On-Site Slaughter & Meat Prep (Single Dedicated Worker)',
    shortDescription: 'When requested, a single experienced worker is dispatched to personally handle both the sanitary slaughter and full meat extraction on-site.',
    fullDescription: 'We assign a dedicated, skilled slaughter worker who comes directly to your location (or handles it at our facility) to conduct the respectful, sanitary slaughter and complete meat extraction, trimming, and custom butchering all in one seamless service.',
    iconName: 'UtensilsCrossed',
    highlights: [
      'One dedicated professional worker assigned to your order',
      'Handles both slaughter and meat extraction from start to finish',
      'Sanitary, respectful process adhering to your custom standards',
      'Customized cuts and packaging ready for cooking or freezing'
    ],
    ctaLabel: 'Request Worker for Slaughter & Prep'
  },
  {
    id: 'events-ceremonies',
    title: 'Holidays, Weddings & Funeral Ceremonies',
    shortDescription: 'Special bulk livestock supply and worker coordination tailored for holiday festivities, weddings, funerals, and memorial banquets.',
    fullDescription: 'We provide hand-selected, high-grade sheep, goats, and cattle for religious holidays (Enkutatash, Meskel, Genna, Fasika, Eid al-Adha, Eid al-Fitr), wedding celebrations, funeral gatherings, and community banquets. Includes advance holding, bulk coordination, and dedicated worker assistance.',
    iconName: 'PartyPopper',
    highlights: [
      'Tailored supply for holidays, weddings, funerals & memorials',
      'Priority selection of prime sheep, goats, and oxen/bulls',
      'Scheduled timely delivery directly to your ceremony venue',
      'Full slaughter and meat preparation worker support available'
    ],
    ctaLabel: 'Arrange Ceremony Supply'
  },
  {
    id: 'meat-by-kg',
    title: 'Prime Beef Supply in KG (for Hotels, Restaurants & Catering)',
    shortDescription: 'Fresh prime beef extracted in kilograms from oxen: Kurt (2,800 ETB/kg), Kitfo (2,200 ETB/kg), Wot (1,800 ETB/kg).',
    fullDescription: 'We provide fresh, clean, and expertly extracted 100% prime Beef sold by the kilogram (KG) for hotels, traditional restaurants, banquet caterers, and private home kitchens. Handpicked from well-fattened oxen and custom-cut for Tre Kurt (2,800 ETB/kg), Kitfo (2,200 ETB/kg), and Wot (1,800 ETB/kg).',
    iconName: 'Scale',
    highlights: [
      '100% Fresh Prime Beef from healthy fattened oxen',
      'Tre Kurt (ጥሬ ቁርጥ): 2,800 ETB / KG',
      'Kitfo Cut (ክትፎ): 2,200 ETB / KG',
      'Wot Stew Cut (ወጥ): 1,800 ETB / KG',
      'Accurate weights measured on certified digital scales',
      'Bulk wholesale contracts available for hotel & restaurant kitchens',
      'Hygienic processing & direct delivery to your kitchen'
    ],
    ctaLabel: 'Order Prime Beef by KG'
  },
  {
    id: 'fresh-slaughtered-sheep',
    title: 'Freshly Slaughtered Sheep Delivery',
    shortDescription: 'The seller delivers a whole, clean, freshly slaughtered sheep directly to your doorstep ready for cooking.',
    fullDescription: 'For customers who want pure, fresh sheep meat without handling a live animal or managing slaughter at home, we perform the complete respectful and sanitary slaughter at our Aware facility just prior to delivery and transport the fresh carcass or partitioned cuts directly to your address.',
    iconName: 'Sparkles',
    highlights: [
      'Slaughtered freshly at our Aware facility right before departure',
      'Sanitary cleaning, skinning, and optional cut portioning',
      'Food-grade clean delivery straight to your doorstep',
      'No hassle of live animal holding or cleaning up at home'
    ],
    ctaLabel: 'Order Fresh Slaughtered Sheep'
  }
];

export const serviceFlowSteps = [
  {
    step: '01',
    title: 'Select Live Animal or Meat by KG',
    description: 'Choose live livestock, freshly slaughtered sheep, or specify meat in kg with your desired Ethiopian beef cut (Kurt, Kitfo, Wot).'
  },
  {
    step: '02',
    title: 'Specify Details & Contact',
    description: 'Call or WhatsApp the seller with your desired kilograms, meal purpose, delivery destination, or ceremony date.'
  },
  {
    step: '03',
    title: 'Preparation at Center',
    description: 'Animals are weighed accurately on certified scales or slaughtered and portioned freshly under strict hygiene standards at Aware.'
  },
  {
    step: '04',
    title: 'Direct Dispatch',
    description: 'Live animals, fresh whole carcasses, or packaged kg cuts are safely dispatched with our transport vehicle.'
  },
  {
    step: '05',
    title: 'Dedicated Worker Support',
    description: 'For on-site requests, a single skilled worker is dispatched to complete custom butchering at your venue.'
  },
  {
    step: '06',
    title: 'Ready for Kitchen & Table',
    description: 'Receive your order fresh and ready for cooking at your home, hotel kitchen, restaurant, or ceremony.'
  }
];
