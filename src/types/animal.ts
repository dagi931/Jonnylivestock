export type AnimalType = "sheep" | "goat" | "cow";
export type AnimalGender = "Male" | "Female";
export type AnimalStatus = "available" | "reserved" | "sold";
export type ThemeMode = "design7" | "design11";

export interface Animal {
  id: string;
  type: AnimalType;
  breed: string;
  gender: AnimalGender;
  weight: number; // in kg
  color: string;
  price: number; // in ETB
  quantity?: number; // Stock count
  location: string;
  description: string;
  status: AnimalStatus;
  images: string[];
  video?: string;
  featured?: boolean;
  characteristics?: string[];
  createdAt: string;
}

export type SortOption =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "weight-asc"
  | "weight-desc";

export interface AnimalFilterOptions {
  searchQuery: string;
  breed: string;
  gender: string;
  minWeight: number | null;
  maxWeight: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  status: string;
  sortBy: SortOption;
}

export interface ReservationFormData {
  animalId: string;
  animalBreed?: string;
  animalPrice?: number;
  name: string;
  phone: string;
  location?: string;
  selectedServices?: string[];
  message: string;
}

export interface ContactFormData {
  name: string;
  phone: string;
  email?: string;
  animalId?: string;
  serviceNeeded?: string;
  message: string;
}
