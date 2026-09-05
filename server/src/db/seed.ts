import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from './prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../data/db.json');

async function main() {
  console.log('🌱 Starting database seeding to Local PostgreSQL...');

  if (!fs.existsSync(DB_PATH)) {
    console.error(`Database file not found at ${DB_PATH}`);
    return;
  }

  const rawData = fs.readFileSync(DB_PATH, 'utf-8');
  const db = JSON.parse(rawData);

  // 1. Seed Users
  if (db.users && db.users.length > 0) {
    console.log(`👤 Seeding ${db.users.length} users...`);
    for (const u of db.users) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {
          name: u.name,
          phone: u.phone,
          passwordHash: u.passwordHash,
          role: u.role
        },
        create: {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          passwordHash: u.passwordHash,
          role: u.role,
          createdAt: u.createdAt ? new Date(u.createdAt) : new Date()
        }
      });
    }
  }

  // 2. Seed Animals
  if (db.animals && db.animals.length > 0) {
    console.log(`🐑 Seeding ${db.animals.length} animals...`);
    for (const a of db.animals) {
      await prisma.animal.upsert({
        where: { id: a.id },
        update: {
          type: a.type,
          breed: a.breed,
          gender: a.gender,
          weight: Number(a.weight),
          color: a.color,
          price: Number(a.price),
          quantity: a.quantity !== undefined ? Number(a.quantity) : 1,
          location: a.location,
          description: a.description,
          status: a.status,
          images: a.images || [],
          video: a.video || null,
          featured: Boolean(a.featured),
          characteristics: a.characteristics || []
        },
        create: {
          id: a.id,
          type: a.type,
          breed: a.breed,
          gender: a.gender,
          weight: Number(a.weight),
          color: a.color,
          price: Number(a.price),
          quantity: a.quantity !== undefined ? Number(a.quantity) : 1,
          location: a.location,
          description: a.description,
          status: a.status,
          images: a.images || [],
          video: a.video || null,
          featured: Boolean(a.featured),
          characteristics: a.characteristics || [],
          createdAt: a.createdAt ? new Date(a.createdAt) : new Date()
        }
      });
    }
  }

  // 3. Seed Bank Accounts
  if (db.bankAccounts && db.bankAccounts.length > 0) {
    console.log(`🏦 Seeding ${db.bankAccounts.length} bank accounts...`);
    for (const b of db.bankAccounts) {
      await prisma.bankAccount.upsert({
        where: { id: b.id },
        update: {
          bankName: b.bankName,
          accountName: b.accountName,
          accountNumber: b.accountNumber,
          instructions: b.instructions || null,
          qrCode: b.qrCode || null,
          isTelebirr: Boolean(b.isTelebirr)
        },
        create: {
          id: b.id,
          bankName: b.bankName,
          accountName: b.accountName,
          accountNumber: b.accountNumber,
          instructions: b.instructions || null,
          qrCode: b.qrCode || null,
          isTelebirr: Boolean(b.isTelebirr)
        }
      });
    }
  }

  // 4. Seed Orders
  if (db.orders && db.orders.length > 0) {
    console.log(`📦 Seeding ${db.orders.length} orders...`);
    for (const o of db.orders) {
      await prisma.order.upsert({
        where: { id: o.id },
        update: {
          status: o.status,
          adminNotes: o.adminNotes || null,
          verifiedAt: o.verifiedAt ? new Date(o.verifiedAt) : null,
          verifiedBy: o.verifiedBy || null
        },
        create: {
          id: o.id,
          userId: o.userId || null,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          customerEmail: o.customerEmail || null,
          deliveryLocation: o.deliveryLocation || null,
          animalId: o.animalId,
          animalBreed: o.animalBreed,
          animalType: o.animalType,
          animalPrice: Number(o.animalPrice),
          selectedServices: o.selectedServices || [],
          servicesFee: Number(o.servicesFee || 0),
          totalAmount: Number(o.totalAmount),
          paymentMethod: o.paymentMethod,
          bankAccountId: o.bankAccountId || null,
          paymentSlipUrl: o.paymentSlipUrl || null,
          transactionReference: o.transactionReference || null,
          customerNotes: o.customerNotes || null,
          status: o.status,
          adminNotes: o.adminNotes || null,
          verifiedAt: o.verifiedAt ? new Date(o.verifiedAt) : null,
          verifiedBy: o.verifiedBy || null,
          createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
          updatedAt: o.updatedAt ? new Date(o.updatedAt) : new Date()
        }
      });
    }
  }

  // 5. Seed Admin Notifications
  if (db.notifications && db.notifications.length > 0) {
    console.log(`🔔 Seeding ${db.notifications.length} notifications...`);
    for (const n of db.notifications) {
      await prisma.adminNotification.upsert({
        where: { id: n.id },
        update: {
          read: n.read
        },
        create: {
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          orderId: n.orderId || null,
          read: Boolean(n.read),
          createdAt: n.createdAt ? new Date(n.createdAt) : new Date()
        }
      });
    }
  }

  // 6. Seed Settings
  if (db.settings) {
    console.log(`⚙️ Seeding settings...`);
    for (const [key, val] of Object.entries(db.settings)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(val) },
        create: { key, value: String(val) }
      });
    }
  }

  console.log('✅ Local PostgreSQL seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
