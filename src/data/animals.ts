import { Animal, AnimalType } from '../types/animal';

export const mockAnimals: Animal[] = [
  // ==================== SHEEP ====================
  {
    id: "SH-001",
    type: "sheep",
    breed: "Debrebirhan",
    gender: "Male",
    weight: 32,
    color: "Solid White with Amber Horns",
    price: 18000,
    location: "Arat Kilo, Addis Ababa",
    description: "Strong, well-proportioned Debrebirhan ram with excellent body conformation and thick wool. Raised on natural pasture grass and supplemental organic forage. Exceptional vigor and calm temperament.",
    status: "available",
    featured: true,
    characteristics: ["Broad chest", "Curved horn structure", "Pasture raised", "Robust build"],
    images: [
      "https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=1200&q=80"
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-sheep-grazing-in-a-green-field-41978-large.mp4",
    createdAt: "2026-08-20"
  },
  {
    id: "SH-002",
    type: "sheep",
    breed: "Ginchi",
    gender: "Male",
    weight: 29,
    color: "Jet Black with Brown Highlights",
    price: 15500,
    location: "Arat Kilo, Addis Ababa",
    description: "Classic highland Ginchi sheep known for high cold tolerance and dense, thick dark fleece. Active, alert, and raised in clean natural highland pastures.",
    status: "available",
    featured: true,
    characteristics: ["Dense dark wool", "Highland breed", "Compact muscular frame"],
    images: [
      "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=1200&q=80"
    ],
    createdAt: "2026-08-22"
  },
  {
    id: "SH-003",
    type: "sheep",
    breed: "Wolayita",
    gender: "Male",
    weight: 38,
    color: "Chestnut Brown & White Belly",
    price: 22000,
    location: "Arat Kilo, Addis Ababa",
    description: "Heavyweight, fast-growing Wolayita breed ram with outstanding body length and deep flank. Excellent meat-conformation and docile temperament.",
    status: "available",
    featured: true,
    characteristics: ["Heavyweight class", "Long loin", "Polled (hornless)", "Rapid growth"],
    images: [
      "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=1200&q=80"
    ],
    createdAt: "2026-08-18"
  },
  {
    id: "SH-004",
    type: "sheep",
    breed: "Arsi",
    gender: "Male",
    weight: 34,
    color: "Light Tan / Fawn",
    price: 19500,
    location: "Arat Kilo, Addis Ababa",
    description: "High quality Arsi ram with distinctive broad build and lean meat distribution. Thrives on local forage with exceptional health history.",
    status: "available",
    featured: false,
    characteristics: ["Short coat", "Broad build", "High fertility pedigree", "Lean muscle"],
    images: [
      "https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=80"
    ],
    createdAt: "2026-08-15"
  },
  {
    id: "SH-005",
    type: "sheep",
    breed: "Debrebirhan",
    gender: "Female",
    weight: 27,
    color: "Pure White Body, Pitch Black Head",
    price: 14000,
    location: "Arat Kilo, Addis Ababa",
    description: "Striking Debrebirhan ewe with clean, glossy coat and balanced frame. Excellent health conditioning, calm and well-nourished.",
    status: "available",
    featured: false,
    characteristics: ["Strong build", "Distinctive markings", "Heat tolerant", "Clean coat"],
    images: [
      "https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80"
    ],
    createdAt: "2026-08-10"
  },
  {
    id: "SH-006",
    type: "sheep",
    breed: "Ginchi",
    gender: "Female",
    weight: 31,
    color: "Reddish Brown",
    price: 16500,
    location: "Arat Kilo, Addis Ababa",
    description: "Healthy Ginchi ewe with excellent mothering traits and deep body capacity. Suitable for breeding or direct meat preparation.",
    status: "reserved",
    featured: false,
    characteristics: ["Strong frame", "Calm handling", "Naturally pastured"],
    images: [
      "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=80"
    ],
    createdAt: "2026-08-05"
  },
  {
    id: "SH-007",
    type: "sheep",
    breed: "Wolayita",
    gender: "Male",
    weight: 26,
    color: "Charcoal Brown",
    price: 13800,
    location: "Arat Kilo, Addis Ababa",
    description: "Compact and sturdy Wolayita yearling ram. Well suited for festive celebrations or smallholder flock introduction.",
    status: "sold",
    featured: false,
    characteristics: ["Highland wool", "Compact", "Energetic"],
    images: [
      "https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=1200&q=80"
    ],
    createdAt: "2026-07-28"
  },
  {
    id: "SH-008",
    type: "sheep",
    breed: "Arsi",
    gender: "Male",
    weight: 41,
    color: "Deep Mahogany Brown",
    price: 25000,
    location: "Arat Kilo, Addis Ababa",
    description: "Premium large-frame Arsi ram weighing over 40kg. Superb musculature and ideal for high-capacity banquet preparation.",
    status: "available",
    featured: true,
    characteristics: ["Heavy class 40kg+", "Exceptional muscle depth", "Hornless"],
    images: [
      "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=1200&q=80"
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-sheep-grazing-in-a-green-field-41978-large.mp4",
    createdAt: "2026-08-24"
  },

  // ==================== GOATS ====================
  {
    id: "GT-001",
    type: "goat",
    breed: "Debrebirhan",
    gender: "Male",
    weight: 36,
    color: "White with Red-Brown Head",
    price: 24000,
    location: "Arat Kilo, Addis Ababa",
    description: "High-grade Debrebirhan buck with heavy muscling, broad back, and signature healthy frame. High meat-to-bone ratio and vigorous health.",
    status: "available",
    featured: true,
    characteristics: ["Superior meat yield", "Broad back loin", "Thick neck structure", "Docile"],
    images: [
      "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511117833895-4b473c0b85d6?auto=format&fit=crop&w=1200&q=80"
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-family-of-goats-in-a-field-41979-large.mp4",
    createdAt: "2026-08-21"
  },
  {
    id: "GT-002",
    type: "goat",
    breed: "Ginchi",
    gender: "Male",
    weight: 30,
    color: "Dark Brown with Black Spine Line",
    price: 17500,
    location: "Arat Kilo, Addis Ababa",
    description: "Hardy Ginchi highland buck with compact, athletic build and lean, flavorful meat profile. Actively browsed on natural shrub and grass.",
    status: "available",
    featured: true,
    characteristics: ["Athletic build", "Glossy dark coat", "Hardy genetics"],
    images: [
      "https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=1200&q=80"
    ],
    createdAt: "2026-08-19"
  },
  {
    id: "GT-003",
    type: "goat",
    breed: "Wolayita",
    gender: "Male",
    weight: 28,
    color: "Light Cream & Gray Speckled",
    price: 16000,
    location: "Arat Kilo, Addis Ababa",
    description: "Resilient Wolayita buck with impressive frame structure and lean conformation. Highly adaptable and robust.",
    status: "available",
    featured: false,
    characteristics: ["Long horns", "Drought resilient", "Lean frame"],
    images: [
      "https://images.unsplash.com/photo-1511117833895-4b473c0b85d6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=1200&q=80"
    ],
    createdAt: "2026-08-14"
  },
  {
    id: "GT-004",
    type: "goat",
    breed: "Arsi",
    gender: "Female",
    weight: 25,
    color: "Spotted Black & White",
    price: 13500,
    location: "Arat Kilo, Addis Ababa",
    description: "Gentle Arsi highland doe with healthy coat and strong maternal history. Clean health record and very responsive.",
    status: "available",
    featured: false,
    characteristics: ["Spotted pattern", "Docile demeanor", "Healthy conditioning"],
    images: [
      "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=1200&q=80"
    ],
    createdAt: "2026-08-11"
  },
  {
    id: "GT-005",
    type: "goat",
    breed: "Debrebirhan",
    gender: "Male",
    weight: 34,
    color: "Glossy Pitch Black",
    price: 21000,
    location: "Arat Kilo, Addis Ababa",
    description: "Premium large-frame Debrebirhan pastoral buck with deep chest, thick legs, and glossy solid coat. Excellent for banquets.",
    status: "available",
    featured: true,
    characteristics: ["Glossy black", "Deep chest", "Pastoralist breed", "Superior weight"],
    images: [
      "https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511117833895-4b473c0b85d6?auto=format&fit=crop&w=1200&q=80"
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-family-of-goats-in-a-field-41979-large.mp4",
    createdAt: "2026-08-23"
  },
  {
    id: "GT-006",
    type: "goat",
    breed: "Ginchi",
    gender: "Female",
    weight: 31,
    color: "White with Brown Ears",
    price: 19000,
    location: "Arat Kilo, Addis Ababa",
    description: "Well-fed Ginchi doe with solid frame and balanced stance. Ready for immediate pickup or delivery.",
    status: "reserved",
    featured: false,
    characteristics: ["Balanced frame", "Wide hip structure", "Healthy feeding history"],
    images: [
      "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=1200&q=80"
    ],
    createdAt: "2026-08-07"
  },
  {
    id: "GT-007",
    type: "goat",
    breed: "Wolayita",
    gender: "Male",
    weight: 27,
    color: "Chestnut Red",
    price: 15000,
    location: "Arat Kilo, Addis Ababa",
    description: "Active Wolayita buck with solid bone density and clean coat. Fully dewormed and vaccinated.",
    status: "sold",
    featured: false,
    characteristics: ["Red coat", "Active", "Dewormed"],
    images: [
      "https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=1200&q=80"
    ],
    createdAt: "2026-07-30"
  },

  // ==================== COWS & CATTLE ====================
  {
    id: "CW-001",
    type: "cow",
    breed: "Debrebirhan",
    gender: "Male",
    weight: 380,
    color: "Light Gray with Dark Points",
    price: 110000,
    location: "Arat Kilo, Addis Ababa",
    description: "Magnificent Debrebirhan bull with deep muscling, pronounced build, and thick dewlap. Outstanding beef conformation, docile handling, and superior meat yield.",
    status: "available",
    featured: true,
    characteristics: ["Pronounced build", "Heavy beef conformation", "Dewlap folds", "Docile bull"],
    images: [
      "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=1200&q=80"
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-cows-grazing-in-a-green-pasture-41977-large.mp4",
    createdAt: "2026-08-22"
  },
  {
    id: "CW-002",
    type: "cow",
    breed: "Ginchi",
    gender: "Female",
    weight: 340,
    color: "Black and White Pied",
    price: 88000,
    location: "Arat Kilo, Addis Ababa",
    description: "Robust Ginchi cow known for high disease resilience and large barrel capacity. Suitable for smallholder farming, milk, or celebration slaughter.",
    status: "available",
    featured: true,
    characteristics: ["Pied color pattern", "Large barrel", "High adaptability", "Vaccinated"],
    images: [
      "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1200&q=80"
    ],
    createdAt: "2026-08-20"
  },
  {
    id: "CW-003",
    type: "cow",
    breed: "Wolayita",
    gender: "Male",
    weight: 320,
    color: "Deep Red / Brown",
    price: 95000,
    location: "Arat Kilo, Addis Ababa",
    description: "Strong, well-built Wolayita ox with broad shoulder span and steady temperament. Well-conditioned on natural grasses and high-energy feeds.",
    status: "available",
    featured: true,
    characteristics: ["Broad shoulders", "Muscular legs", "Placid temperament", "Prime meat build"],
    images: [
      "https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1200&q=80"
    ],
    createdAt: "2026-08-16"
  },
  {
    id: "CW-004",
    type: "cow",
    breed: "Arsi",
    gender: "Male",
    weight: 410,
    color: "Speckled White & Brown with Long Horns",
    price: 135000,
    location: "Arat Kilo, Addis Ababa",
    description: "Large, tall Arsi steer with impressive horn structure and commanding stature. Exceptional meat weight, prime for major celebrations, weddings, or corporate banquets.",
    status: "available",
    featured: false,
    characteristics: ["Tall frame 400kg+", "Horn structure", "High dress-out percentage"],
    images: [
      "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1200&q=80"
    ],
    video: "https://assets.mixkit.co/videos/preview/mixkit-cows-grazing-in-a-green-pasture-41977-large.mp4",
    createdAt: "2026-08-25"
  },
  {
    id: "CW-005",
    type: "cow",
    breed: "Debrebirhan",
    gender: "Female",
    weight: 290,
    color: "Solid Fawn / Tan",
    price: 78000,
    location: "Arat Kilo, Addis Ababa",
    description: "Young, healthy Debrebirhan heifer with clean bloodline, alert eyes, and smooth coat. Excellent for breeding herd expansion or premium beef.",
    status: "reserved",
    featured: false,
    characteristics: ["Clean bloodline", "Compact frame", "Healthy pedigree"],
    images: [
      "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1200&q=80"
    ],
    createdAt: "2026-08-12"
  },
  {
    id: "CW-006",
    type: "cow",
    breed: "Ginchi",
    gender: "Male",
    weight: 350,
    color: "Black & Brown Brindle",
    price: 102000,
    location: "Arat Kilo, Addis Ababa",
    description: "Solid Ginchi bull with excellent chest depth and healthy hoof structure. Raised in organic pastoral farm facility.",
    status: "sold",
    featured: false,
    characteristics: ["Brindle coat", "Deep girth", "Vaccinated"],
    images: [
      "https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=1200&q=80"
    ],
    createdAt: "2026-07-25"
  }
];

// Helper functions for easy filtering
export const getSheep = (): Animal[] => mockAnimals.filter(a => a.type === 'sheep');
export const getGoats = (): Animal[] => mockAnimals.filter(a => a.type === 'goat');
export const getCows = (): Animal[] => mockAnimals.filter(a => a.type === 'cow');

export const getAnimalById = (id: string): Animal | undefined => {
  return mockAnimals.find(a => a.id.toLowerCase() === id.toLowerCase());
};

export const getFeaturedAnimals = (type?: AnimalType): Animal[] => {
  if (type) {
    return mockAnimals.filter(a => a.type === type && a.featured);
  }
  return mockAnimals.filter(a => a.featured);
};

export const getBreeds = (type?: AnimalType): string[] => {
  const animals = type ? mockAnimals.filter(a => a.type === type) : mockAnimals;
  return Array.from(new Set(animals.map(a => a.breed)));
};

export const updateMockAnimalStatus = (id: string, status: Animal['status']): void => {
  const item = mockAnimals.find(a => a.id.toLowerCase() === id.toLowerCase());
  if (item) {
    item.status = status;
    if (status === 'sold') {
      item.quantity = 0;
    }
  }
};

