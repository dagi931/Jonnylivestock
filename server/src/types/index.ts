export type AnimalType = 'sheep' | 'goat' | 'cow' | 'hen';
export type AnimalGender = 'Male' | 'Female';
export type AnimalStatus = 'available' | 'reserved' | 'sold';

export interface Animal {
  id: string;
  type: AnimalType;
  breed: string;
  gender: AnimalGender;
  weight: number; // in kg
  color: string;
  price: number; // in ETB
  quantity?: number; // Stock count (defaults to 1 for individual head)
  location: string;
  description: string;
  status: AnimalStatus;
  images: string[];
  video?: string;
  featured?: boolean;
  characteristics?: string[];
  createdAt: string;
}

export type OrderStatus =
  | 'pending_verification'
  | 'reservation_pending'
  | 'reserved'
  | 'final_payment_pending'
  | 'verified'
  | 'pickup_ready'
  | 'completed'
  | 'delivery_pending'
  | 'delivered'
  | 'rejected';

// ==================== PACKAGES ====================
export type PackageCategory = 'meat_livestock' | 'wine' | 'eggs' | 'flowers';

export interface PackageCatalogItem {
  id: string;
  category: PackageCategory;
  name: string;
  amharicName?: string;
  description: string;
  amharicDescription?: string;
  price: number; // in ETB
  unit?: string; // e.g. "per head", "per bottle", "per crate (30 pcs)", "per 5kg"
  amharicUnit?: string;
  image: string;
  popular?: boolean;
}

export interface PreMadePackage {
  id: string;
  name: string;
  amharicName?: string;
  tagline: string;
  amharicTagline?: string;
  description: string;
  amharicDescription?: string;
  categoryCount: number;
  items: PackageCatalogItem[];
  originalPrice: number;
  packagePrice: number;
  savings: number;
  badge?: string;
  image: string;
  featured?: boolean;
  totalSlots?: number;
  availableSlots?: number;
  isOutOfStock?: boolean;
}

export interface SavedPackage {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  items: PackageCatalogItem[];
  totalPrice: number;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions?: string;
  qrCode?: string;
  isTelebirr?: boolean;
}

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryLocation?: string;

  // Animal specific (optional for package orders)
  animalId?: string;
  animalBreed?: string;
  animalType?: string;
  animalPrice?: number;

  // Package specific
  isPackage?: boolean;
  packageName?: string;
  packageDetails?: {
    name?: string;
    items: PackageCatalogItem[];
    categoriesCount: number;
    hasFreeDelivery: boolean;
  } | any;

  // Reservation & 50% Deposit Flow
  isReservation?: boolean;
  depositAmount?: number; // 50% of totalAmount
  remainingAmount?: number; // remaining 50%
  finalPaymentSlipUrl?: string; // uploaded receipt for remaining 50%
  finalPaymentMethod?: string;
  finalTransactionRef?: string;
  finalVerifiedAt?: string;
  finalVerifiedBy?: string;

  // Delivery fields
  isDelivery?: boolean;
  deliveryAddress?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  pickupAddress?: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  distanceKm?: number;
  distanceCategory?: 'short' | 'medium' | 'long';
  vehicleType?: 'car' | 'pickup' | 'large_pickup';
  vehicleName?: string;
  deliveryFee?: number;
  estimatedDurationMinutes?: number;
  deliveryApprovedAt?: string;
  deliveryApprovedBy?: string;

  selectedServices?: string[];
  servicesFee?: number;
  totalAmount: number;
  paymentMethod: string; // e.g. "Telebirr", "CBE", "Bank of Abyssinia", "Awash Bank"
  bankAccountId?: string;
  paymentSlipUrl?: string; // Path or URL to initial uploaded payment receipt
  transactionReference?: string;
  customerNotes?: string;
  status: OrderStatus;
  adminNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

export interface AdminNotification {
  id: string;
  type:
  | 'NEW_ORDER_SLIP'
  | 'NEW_RESERVATION_DEPOSIT'
  | 'FINAL_PAYMENT_SLIP'
  | 'RESERVATION_APPROVED'
  | 'PAYMENT_VERIFIED'
  | 'ORDER_REJECTED'
  | 'OUT_OF_STOCK'
  | 'CONTACT_MESSAGE'
  | 'GENERAL';
  title: string;
  message: string;
  orderId?: string;
  read: boolean;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  animalId?: string;
  serviceNeeded?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export type RealtimeEventType =
  | 'CONNECTED'
  | 'HEARTBEAT'
  | 'NEW_ORDER_SLIP'
  | 'NEW_RESERVATION_DEPOSIT'
  | 'FINAL_PAYMENT_SLIP'
  | 'RESERVATION_APPROVED'
  | 'ORDER_VERIFIED'
  | 'ORDER_REJECTED'
  | 'ORDER_UPDATED'
  | 'DELIVERY_APPROVED'
  | 'DELIVERY_UPDATED'
  | 'OUT_OF_STOCK'
  | 'CONTACT_MESSAGE'
  | 'ANIMAL_UPDATED'
  | 'ANIMAL_CREATED'
  | 'ANIMAL_DELETED'
  | 'NOTIFICATION_CREATED'
  | 'NOTIFICATIONS_READ';

export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions?: string;
  qrCode?: string;
  isTelebirr?: boolean;
  createdAt: string;
}

export interface DatabaseSchema {
  animals: Animal[];
  orders: Order[];
  users: User[];
  bankAccounts: BankAccount[];
  notifications: AdminNotification[];
  savedPackages?: SavedPackage[];
  settings?: Record<string, string>;
}

export interface RealtimeEvent<T = any> {
  type: RealtimeEventType;
  payload: T;
  timestamp: string;
}
