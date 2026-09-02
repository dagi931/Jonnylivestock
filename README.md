# 🐑 Jonny Livestock & Celebration Packages 🍷🥚💐

A modern, full-stack Ethiopian livestock marketplace and holiday celebration packages platform built with **React (TypeScript + Vite + Tailwind CSS)** and **Node.js (Express + Prisma + Supabase PostgreSQL)**.

---

## 🚀 Quick Start for Anyone Cloning This Repository

### 1. Clone the Repository
`ash
git clone https://github.com/dagi931/Jonnylivestock.git
cd Jonnylivestock
`

---

### 2. Frontend Setup (Client)
The frontend is built with React, Vite, and Tailwind CSS. It has built-in offline mock data fallback, so you can preview the full website UI even without running the backend!

`ash
# 1. Install frontend dependencies
npm install

# 2. Start the Vite development server
npm run dev
`
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 3. Backend Setup (API Server & PostgreSQL Database)
The backend manages users, Brevo email OTPs, livestock inventory, orders, 50% reservation deposits, and admin slip verification.

`ash
# 1. Navigate to the server folder
cd server

# 2. Install backend dependencies
npm install

# 3. Create your environment file from the template
cp .env.example .env
# (Or on Windows: copy .env.example .env)

# 4. Fill in your DATABASE_URL and Brevo API key in server/.env:
# DATABASE_URL=" postgresql://...\
# DIRECT_URL=\postgresql://...\
# BREVO_API_KEY=\xkeysib-...\
# BREVO_SENDER_EMAIL=\your_email@gmail.com\

# 5. Generate Prisma database client
npx prisma generate

# 6. (Optional) Push schema and seed initial database animals/packages
npx prisma db push
npm run seed

# 7. Start the backend API server
npm run dev
`
The API server will be live at [http://localhost:5000](http://localhost:5000).

---

## 🔐 Default Demo Accounts

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin (Jonny)** | dmin@jonnylivestock.com | dmin123 | Full Admin Dashboard at /admin, slip verification, inventory & package manager |
| **Demo Customer** | customer@example.com | customer123 | Browsing, ordering, 50% reservation deposit, slip upload |

---

## ✨ Features

- **Live Animal Inventory**: Browse rams, sheep, goats, bulls, and hens with weights, prices, breeds, and photos.
- **Holiday & Celebration Packages**: All-inclusive bundles combining meat/livestock, Rift Valley wines/tej, farm-fresh eggs, and celebration flowers with free delivery.
- **50% Reservation Deposit**: Customers reserve livestock with a 50% bank transfer deposit and complete payment prior to delivery.
- **Brevo Email OTP**: Secure 6-digit email OTP verification for new customer registrations.
- **Real-Time Admin Dashboard**: Live notifications with sound alerts, customer phone attachment, slip inspector with zoom, and direct approval/rejection workflows.
