export type VehicleTypeId = 'car' | 'pickup' | 'large_pickup';
export type DistanceCategory = 'short' | 'medium' | 'long';

export interface DeliveryVehicleConfig {
  id: VehicleTypeId;
  name: string;
  amharicName?: string;
  description: string;
  amharicDescription?: string;
  icon: string;
  baseFee: number;
  pricePerKm: number;
  maxSheep: number;
  maxGoats: number;
  maxCattle: number;
  maxChickens: number;
  maxWeightKg: number;
  isActive: boolean;
}

export interface DeliverySetting {
  id: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  maxDistanceKm: number;
  shortDistanceMaxKm: number;
  mediumDistanceMaxKm: number;
}

export interface DeliveryLoadItem {
  type: 'sheep' | 'goat' | 'cow' | 'hen' | 'meat' | 'package' | 'wine' | 'eggs' | 'flowers' | 'other';
  name?: string;
  quantity: number;
  weightKg?: number;
}

export interface VehicleQuoteResult {
  id: VehicleTypeId;
  name: string;
  amharicName?: string;
  description: string;
  icon: string;
  baseFee: number;
  pricePerKm: number;
  deliveryFee: number;
  isSuitable: boolean;
  unsuitabilityReason?: string;
  isRecommended: boolean;
  capacity: {
    maxSheep: number;
    maxGoats: number;
    maxCattle: number;
    maxChickens: number;
    maxWeightKg: number;
  };
}

export interface DeliveryQuoteResponse {
  success: boolean;
  pickupLocation: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  deliveryLocation: {
    address: string;
    lat: number;
    lng: number;
  };
  distanceKm: number;
  estimatedDurationMinutes: number;
  distanceCategory: DistanceCategory;
  distanceCategoryLabel: string;
  amharicCategoryLabel: string;
  isWithinRange: boolean;
  maxDistanceKm: number;
  loadSummary: {
    sheep: number;
    goats: number;
    cattle: number;
    chickens: number;
    meatKg: number;
    totalWeightKg: number;
  };
  vehicles: VehicleQuoteResult[];
  recommendedVehicleId?: VehicleTypeId;
  error?: string;
}

export interface SelectedDeliveryLocation {
  address: string;
  lat: number;
  lng: number;
  isCustomPin?: boolean;
}
