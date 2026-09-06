export type PackageCategory = 'meat_livestock' | 'wine' | 'eggs' | 'flowers';

export interface PackageCatalogItem {
  id: string;
  category: PackageCategory;
  name: string;
  amharicName?: string;
  description: string;
  amharicDescription?: string;
  price: number; // in ETB
  unit?: string;
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

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryLocation?: string;

  // Animal specific
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

  // 50% Reservation Flow
  isReservation?: boolean;
  depositAmount?: number;
  remainingAmount?: number;
  finalPaymentSlipUrl?: string;
  finalPaymentMethod?: string;
  finalTransactionRef?: string;
  finalVerifiedAt?: string;
  finalVerifiedBy?: string;

  // Delivery specific fields
  isDelivery?: boolean;
  deliveryAddress?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  vehicleType?: string;
  vehicleName?: string;
  distanceCategory?: string;
  deliveryFee?: number;
  distanceKm?: number;
  deliveryApprovedAt?: string;
  deliveryApprovedBy?: string;
  deliveredAt?: string;

  selectedServices?: string[];
  servicesFee?: number;
  totalAmount: number;
  paymentMethod: string;
  bankAccountId?: string;
  paymentSlipUrl?: string;
  transactionReference?: string;
  customerNotes?: string;
  status: OrderStatus;
  adminNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}
