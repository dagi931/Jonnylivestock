# 🐑 Jonny Livestock & Celebration Packages 🍷🥚💐

A modern, full-stack Ethiopian livestock marketplace and holiday celebration packages platform built with **React (TypeScript + Vite + Tailwind CSS)** and **Node.js (Express + Prisma + Supabase PostgreSQL)**.

Unified with **npm Workspaces** for 1-command installation and execution!

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
`ash
git clone https://github.com/dagi931/Jonnylivestock.git
cd Jonnylivestock
`

---

### 2. Install All Dependencies (Frontend + Backend)
With npm Workspaces, you only need to run 
pm install once from the root folder:
`ash
npm install
`

---

### 3. Setup Backend Environment (server/.env)
Create server/.env using server/.env.example as a template:
`ash
cp server/.env.example server/.env
# On Windows: copy server\.env.example server\.env
`
Ensure your database connection string and Brevo credentials are in server/.env:
`env
PORT=5000
JWT_SECRET=jonny_livestock_super_secret_jwt_key_2026
DATABASE_URL= postgresql://postgres:password@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:password@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_EMAIL=dagiderbe59@gmail.com
BREVO_SENDER_NAME=Jonny Livestock
`

Generate the Prisma Client:
`ash
npm run prisma:generate
`

---

### 4. Start Fullstack Application (Frontend + Backend)
Run both the React frontend and Express backend concurrently:
`ash
npm run dev:all
`
- 🌐 **Frontend**: [http://localhost:5173](http://localhost:5173)
- 🚀 **Backend API**: [http://localhost:5000](http://localhost:5000)
- 🩺 **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔐 Default Demo Accounts

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin (Jonny)** | dmin@jonnylivestock.com | dmin123 | Full Admin Dashboard at /admin, slip verification, inventory & package manager |
| **Demo Customer** | customer@example.com | customer123 | Browsing, ordering, 50% reservation deposit, slip upload |

---

## ✨ Features

- **Live Animal Inventory**: Browse rams, sheep, goats, bulls, and hens with live weights, prices, breeds, and photos.
- **Holiday & Celebration Packages**: All-inclusive bundles combining meat/livestock, Rift Valley wines/tej, farm-fresh eggs, and celebration flowers.
- **50% Reservation Deposit**: Customers reserve livestock with a 50% bank transfer deposit and complete payment prior to delivery.
- **Brevo Email OTP**: Secure 6-digit email OTP verification for new customer registrations.
- **Real-Time Admin Dashboard**: Live notifications with sound alerts, customer phone attachment, slip inspector with zoom, and direct approval/rejection workflows.
