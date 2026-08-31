export interface ServiceItem {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  iconName: string;
  highlights: string[];
  ctaLabel: string;
}

export interface ServiceRequestFormData {
  animalId?: string;
  customerName: string;
  phoneNumber: string;
  location: string;
  selectedServices: string[];
  meatAnimalType?: 'sheep' | 'goat' | 'cow' | 'mixed';
  meatQuantityKg?: string;
  mealPurposes?: string[];
  businessType?: 'hotel_restaurant' | 'catering' | 'household' | 'ceremony';
  additionalMessage: string;
}
