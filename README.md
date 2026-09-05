# 🐂 Jonny Livestock (ጆኒ ከብት እርባታ)

> **Your One-Stop Livestock Shop · የታመነ የቀንድ ከብትና የበግ እርባታ**  
> Direct farm-to-doorstep livestock sales, fresh meat cuts, celebration packages, and butcher preparation services in Addis Ababa, Ethiopia.

---

## 🌟 Overview

**Jonny Livestock** is a modern, full-stack digital platform for a premier single-owner livestock farm based in Aware, Addis Ababa. The platform empowers customers and hospitality businesses (hotels, restaurants, banquet halls) to browse live animals with certified digital scale weights, order custom butchery cuts by the kilogram, build celebration packages, and manage orders with real-time verification and refrigerated delivery.

---

## ✨ Key Features

### 🐑 1. Livestock Catalog & Certified Weights
- **Premium Ethiopian Breeds**: Handpicked selection of **Debrebirhan**, **Ginchi**, **Wolayita**, and **Arsi** across Sheep, Goats, and Cattle.
- **Accurate Details**: High-resolution image galleries, video previews, live scale weights (kg), characteristics, and transparent single-seller pricing.
- **Dynamic Multi-Criteria Filters**: Filter animals by breed, gender, weight range, price bracket, and availability status (Available, Reserved, Sold).

### 🥩 2. Fresh Meat by KG & Custom Cuts
- **Premium Cut Selection**: Order fresh beef, lamb, and goat meat by weight.
- **Culinary Cuts**: Kurt, Kitfo, Tibs, Traditional Dulet blend, Goden & Kikel bone-in ribs for frying, roasting, and traditional Ethiopian stews.
- **Transparent Pricing**: Accurate digital scale weighing with optional vacuum packaging and custom portioning.

### 🎁 3. Celebration Packages & Custom Builder
- **Pre-made Holiday Bundles**: Curated packages pairing prime sheep/oxen with Rift Valley Reserve wine, farm-fresh eggs, and luxury rose bouquets.
- **Interactive Package Builder**: Create custom packages mixing livestock, meats, side items, and gifts with live discount calculators.
- **Slot Reservation System**: 50% deposit reservation workflow with countdowns and out-of-stock badges.

### 🌐 4. Full Bilingual Experience (English & Amharic)
- Instant one-click toggle between **English** and **Amharic (አማርኛ)**.
- Cultural alignment and natural Ethiopian phrasing across all pages, notices, and order summaries.

### 🔐 5. Secure Authentication & Verification
- **6-digit OTP Verification**: Passwordless registration and secure password resets powered by Brevo email dispatch.
- **JWT Session Management**: Persistent user profiles and secure administrative access.
- **Multi-Tier Rate Limiting**: Built-in protection against brute-force attacks and OTP flooding using `express-rate-limit`.

### 📊 6. Comprehensive Admin Dashboard
- **Live Inventory Manager**: Add, edit, upload photos, and update animal status with instant UI sync.
- **Order & Payment Verification**: Inspect bank payment slips and Telebirr transaction receipts, verify orders, or reject with customer notes.
- **Package Slot & Stock Control**: Adjust available slots per bundle and trigger out-of-stock alerts.
- **Customer Inquiry Center**: Review and manage incoming direct customer inquiries and service bookings.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Responsive, mobile-first design with rich earthy tones)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)

### Backend & Database
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Server Framework**: [Express.js](https://expressjs.com/) with TypeScript
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Local PostgreSQL / Cloud PostgreSQL)
- **ORM**: [Prisma ORM v6](https://www.prisma.io/)
- **Security & Rate Limiting**: `express-rate-limit`, `bcryptjs`, `jsonwebtoken`
- **File Uploads**: `multer`
- **Email Service**: [Brevo REST API](https://www.brevo.com/) for transactional OTPs and alerts

---

## 📂 Project Structure

```text
├── server/                       # Backend API server
│   ├── data/
│   │   └── db.json               # Seed database and fallback store
│   ├── prisma/
│   │   └── schema.prisma         # Prisma PostgreSQL database schema
│   ├── src/
│   │   ├── data/                 # Server package catalogs & constants
│   │   ├── db/                   # Prisma client, seed scripts & DB utilities
│   │   ├── middleware/           # Auth, file upload & rate limiting middlewares
│   │   ├── routes/               # Express route handlers (auth, animals, orders, etc.)
│   │   ├── services/             # Email (Brevo) and Realtime notification services
│   │   ├── types/                # Backend TypeScript types
│   │   └── server.ts             # Express server entry point
│   ├── package.json
│   └── tsconfig.json
├── src/                          # Frontend React application
│   ├── components/               # UI components (animals, home, modals, services)
│   ├── config/                   # Business configuration & contact constants
│   ├── context/                  # Context providers (Auth, Language, Theme, Realtime)
│   ├── data/                     # Animals mock data, packages catalog & translations
│   ├── hooks/                    # Custom hooks (useAnimals, useAnimalFilters)
│   ├── pages/                    # Routed pages (Home, Sheep, Goats, Cows, Admin, etc.)
│   ├── services/                 # Frontend API client
│   ├── types/                    # Frontend TypeScript interfaces
│   ├── utils/                    # Formatters and helper utilities
│   ├── App.tsx                   # App router & layout entry
│   └── main.tsx                  # React DOM mount point
├── index.html                    # HTML entry template
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com/dagi931/Jonnylivestock.git
cd Jonnylivestock
```

### 2. Install Dependencies
Install frontend and backend dependencies:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Setup Environment Variables
Create a `.env` file inside the `server/` directory:

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
DATABASE_URL="postgresql://postgres:1234@localhost:5432/jonny_livestock"
DIRECT_URL="postgresql://postgres:1234@localhost:5432/jonny_livestock"
BREVO_API_KEY="your_brevo_api_key"
BREVO_SENDER_EMAIL="info@jonnylivestock.com"
BREVO_SENDER_NAME="Jonny Livestock"
```

### 4. Seed Database (Optional)
To seed initial animals, bank accounts, settings, and celebration packages to PostgreSQL:

```bash
cd server
npm run seed
cd ..
```

### 5. Run in Development Mode
You can run both backend and frontend concurrently:

```bash
# Terminal 1: Start Backend API (runs on port 5000)
cd server
npm run dev

# Terminal 2: Start Frontend (runs on port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Build & Production Verification

```bash
# Type check and build backend
cd server
npm run build
cd ..

# Type check and build frontend bundle
npm run build
```

---

## 📍 Contact & Farm Details

- **Farm Location**: Queen Elizabeth Street, Aware, Addis Ababa, Ethiopia
- **Phone / WhatsApp**: +251 910 194 903
- **Email**: info@jonnylivestock.com
- **Operating Hours**: Monday – Saturday: 7:00 AM – 6:30 PM (Sunday: 8:00 AM – 2:00 PM)

---

## 📄 License
All rights reserved © 2026 Jonny Livestock.
