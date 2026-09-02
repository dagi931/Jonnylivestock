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
  price: number; // in ETB
  unit?: string; // e.g. "per head", "per bottle", "per crate (30 pcs)", "per 5kg"
  image: string;
  popular?: boolean;
}

export interface PreMadePackage {
  id: string;
  name: string;
  amharicName?: string;
  tagline: string;
  description: string;
  categoryCount: number;
  items: PackageCatalogItem[];
  originalPrice: number;
  packagePrice: number;
  savings: number;
  badge: string;
  image: string;
  featured?: boolean;
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
    | 'GENERAL';
  title: string;
  message: string;
  orderId?: string;
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
