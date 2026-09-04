export interface BusinessConfig {
  name: string;
  tagline: string;
  phone: string;
  displayPhone: string;
  whatsapp: string;
  displayWhatsapp: string;
  email: string;
  location: string;
  city: string;
  country: string;
  businessHours: string;
  currency: string;
  description: string;
}

export const business: BusinessConfig = {
  name: "Jonny Livestock",
  tagline: "Your One-Stop Livestock Shop",
  phone: "+251910194903",
  displayPhone: "+251 910 194 903",
  whatsapp: "251910194903",
  displayWhatsapp: "+251 910 194 903",
  email: "info@jonnylivestock.com",
  location: "Queen Elizabeth Street, Aware, Addis Ababa, Ethiopia",
  city: "Aware, Addis Ababa",
  country: "Ethiopia",
  businessHours: "Monday – Saturday: 7:00 AM – 6:30 PM (Sunday: 8:00 AM – 2:00 PM)",
  currency: "ETB",
  description: "Direct livestock farm offering healthy, carefully selected sheep, goats, and cows with transparent weights, honest pricing, and complete farm-to-table delivery and preparation services."
};
