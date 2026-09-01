export type AnimalType = 'sheep' | 'goat' | 'cow';
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
  location: string;
  description: string;
  status: AnimalStatus;
  images: string[];
  video?: string;
  featured?: boolean;
  characteristics?: string[];
  createdAt: string;
}

export type OrderStatus = 'pending_verification' | 'verified' | 'rejected' | 'completed';

export interface OrderItem {
  animalId: string;
  breed: string;
  type: AnimalType;
  price: number;
  image?: string;
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
  animalId: string;
  animalBreed: string;
  animalType: AnimalType;
  animalPrice: number;
  selectedServices?: string[];
  servicesFee?: number;
  totalAmount: number;
  paymentMethod: string; // e.g. "Telebirr", "CBE", "Bank of Abyssinia", "Awash Bank"
  bankAccountId?: string;
  paymentSlipUrl?: string; // Path or URL to uploaded payment receipt
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
  type: 'NEW_ORDER_SLIP' | 'PAYMENT_VERIFIED' | 'ORDER_REJECTED' | 'GENERAL';
  title: string;
  message: string;
  orderId?: string;
  read: boolean;
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  animals: Animal[];
  orders: Order[];
  notifications: AdminNotification[];
  bankAccounts: BankAccount[];
  settings: {
    businessName: string;
    phone: string;
    displayPhone: string;
    whatsapp: string;
    telegram: string;
    email: string;
    location: string;
    currency: string;
  };
}
