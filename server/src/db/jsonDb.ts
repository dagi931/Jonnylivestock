import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSchema, Animal, Order, User, AdminNotification, BankAccount } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../data/db.json');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export class JsonDB {
  private static readDB(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_PATH)) {
        throw new Error(`Database file not found at ${DB_PATH}`);
      }
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading JSON database:', error);
      throw error;
    }
  }

  private static writeDB(data: DatabaseSchema): void {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing to JSON database:', error);
      throw error;
    }
  }

  // ==================== ANIMALS ====================
  public static getAnimals(): Animal[] {
    const db = this.readDB();
    return db.animals || [];
  }

  public static getAnimalById(id: string): Animal | undefined {
    const animals = this.getAnimals();
    return animals.find(a => a.id.toLowerCase() === id.toLowerCase());
  }

  public static createAnimal(animalData: Animal): Animal {
    const db = this.readDB();
    if (animalData.quantity === undefined) {
      animalData.quantity = 1;
    }
    db.animals.unshift(animalData);
    this.writeDB(db);
    return animalData;
  }

  public static updateAnimal(id: string, updates: Partial<Animal>): Animal | null {
    const db = this.readDB();
    const index = db.animals.findIndex(a => a.id.toLowerCase() === id.toLowerCase());
    if (index === -1) return null;

    db.animals[index] = { ...db.animals[index], ...updates };
    this.writeDB(db);
    return db.animals[index];
  }

  public static deleteAnimal(id: string): boolean {
    const db = this.readDB();
    const initialLen = db.animals.length;
    db.animals = db.animals.filter(a => a.id.toLowerCase() !== id.toLowerCase());
    if (db.animals.length !== initialLen) {
      this.writeDB(db);
      return true;
    }
    return false;
  }

  // ==================== USERS ====================
  public static getUsers(): User[] {
    const db = this.readDB();
    return db.users || [];
  }

  public static findUserByEmail(email: string): User | undefined {
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public static findUserById(id: string): User | undefined {
    const users = this.getUsers();
    return users.find(u => u.id === id);
  }

  public static createUser(user: User): User {
    const db = this.readDB();
    db.users.push(user);
    this.writeDB(db);
    return user;
  }

  // ==================== ORDERS ====================
  public static getOrders(): Order[] {
    const db = this.readDB();
    return db.orders || [];
  }

  public static getOrdersByUserId(userId: string): Order[] {
    const orders = this.getOrders();
    return orders.filter(o => o.userId === userId);
  }

  public static getOrderById(id: string): Order | undefined {
    const orders = this.getOrders();
    return orders.find(o => o.id.toLowerCase() === id.toLowerCase());
  }

  public static createOrder(order: Order): { order: Order; notification: AdminNotification; animal: Animal | null } {
    const db = this.readDB();
    db.orders.unshift(order);

    // Also automatically create an Admin Notification
    const notif: AdminNotification = {
      id: `NOTIF-${Date.now().toString().slice(-6)}`,
      type: 'NEW_ORDER_SLIP',
      title: 'New Payment Slip Uploaded',
      message: `${order.customerName} uploaded a payment slip for ${order.animalBreed} (${order.animalId}) - ${order.totalAmount.toLocaleString()} ETB.`,
      orderId: order.id,
      read: false,
      createdAt: new Date().toISOString()
    };
    db.notifications.unshift(notif);

    // Reserve animal
    let updatedAnimal: Animal | null = null;
    const animalIndex = db.animals.findIndex(a => a.id.toLowerCase() === order.animalId.toLowerCase());
    if (animalIndex !== -1) {
      // If quantity is 1 or undefined, mark as reserved
      const currentQty = db.animals[animalIndex].quantity ?? 1;
      if (currentQty <= 1) {
        db.animals[animalIndex].status = 'reserved';
      }
      updatedAnimal = db.animals[animalIndex];
    }

    this.writeDB(db);
    return { order, notification: notif, animal: updatedAnimal };
  }

  public static verifyOrder(orderId: string, adminName: string, adminNotes?: string): { order: Order; animal: Animal | null; notification: AdminNotification } | null {
    const db = this.readDB();
    const orderIndex = db.orders.findIndex(o => o.id.toLowerCase() === orderId.toLowerCase());
    if (orderIndex === -1) return null;

    const order = db.orders[orderIndex];
    order.status = 'verified';
    order.verifiedAt = new Date().toISOString();
    order.verifiedBy = adminName;
    if (adminNotes) order.adminNotes = adminNotes;
    order.updatedAt = new Date().toISOString();

    // Automatically reduce animal quantity or mark as SOLD
    let updatedAnimal: Animal | null = null;
    const animalIndex = db.animals.findIndex(a => a.id.toLowerCase() === order.animalId.toLowerCase());
    if (animalIndex !== -1) {
      const animal = db.animals[animalIndex];
      const currentQty = animal.quantity !== undefined ? animal.quantity : 1;
      const newQty = Math.max(0, currentQty - 1);
      
      animal.quantity = newQty;
      if (newQty === 0) {
        animal.status = 'sold';
      } else {
        animal.status = 'available'; // still has stock available
      }

      updatedAnimal = animal;
    }

    // Add verification notification
    const notif: AdminNotification = {
      id: `NOTIF-${Date.now().toString().slice(-6)}`,
      type: 'PAYMENT_VERIFIED',
      title: 'Order Payment Verified',
      message: `Order ${order.id} for ${order.animalBreed} has been verified and marked as SOLD by ${adminName}.`,
      orderId: order.id,
      read: false,
      createdAt: new Date().toISOString()
    };
    db.notifications.unshift(notif);

    this.writeDB(db);
    return { order, animal: updatedAnimal, notification: notif };
  }

  public static rejectOrder(orderId: string, reason: string): { order: Order; animal: Animal | null } | null {
    const db = this.readDB();
    const orderIndex = db.orders.findIndex(o => o.id.toLowerCase() === orderId.toLowerCase());
    if (orderIndex === -1) return null;

    const order = db.orders[orderIndex];
    order.status = 'rejected';
    order.adminNotes = reason;
    order.updatedAt = new Date().toISOString();

    // If the animal was set to reserved, restore it to available
    let updatedAnimal: Animal | null = null;
    const animalIndex = db.animals.findIndex(a => a.id.toLowerCase() === order.animalId.toLowerCase());
    if (animalIndex !== -1) {
      if (db.animals[animalIndex].status === 'reserved') {
        db.animals[animalIndex].status = 'available';
      }
      updatedAnimal = db.animals[animalIndex];
    }

    // Add rejection notification
    db.notifications.unshift({
      id: `NOTIF-${Date.now().toString().slice(-6)}`,
      type: 'ORDER_REJECTED',
      title: 'Order Slip Rejected',
      message: `Order ${order.id} for ${order.animalBreed} was rejected. Reason: ${reason}`,
      orderId: order.id,
      read: false,
      createdAt: new Date().toISOString()
    });

    this.writeDB(db);
    return { order, animal: updatedAnimal };
  }

  // ==================== NOTIFICATIONS ====================
  public static getNotifications(): AdminNotification[] {
    const db = this.readDB();
    return db.notifications || [];
  }

  public static markNotificationRead(id: string): boolean {
    const db = this.readDB();
    const notif = db.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.writeDB(db);
      return true;
    }
    return false;
  }

  public static markAllNotificationsRead(): void {
    const db = this.readDB();
    db.notifications.forEach(n => (n.read = true));
    this.writeDB(db);
  }

  // ==================== BANK ACCOUNTS & SETTINGS ====================
  public static getBankAccounts(): BankAccount[] {
    const db = this.readDB();
    return db.bankAccounts || [];
  }

  public static getSettings() {
    const db = this.readDB();
    return db.settings;
  }
}
