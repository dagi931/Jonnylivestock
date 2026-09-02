import { Animal } from '../types/animal';
import { PackageCatalogItem, PreMadePackage, SavedPackage, Order } from '../types/package';

export type { Order };

const API_BASE = '/api';

export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions?: string;
  qrCode?: string;
  isTelebirr?: boolean;
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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
}

class ApiService {
  private getHeaders(token?: string | null, isJson = true): HeadersInit {
    const headers: Record<string, string> = {};
    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }
    const adminToken = localStorage.getItem('jonny_admin_token');
    const userToken = localStorage.getItem('jonny_user_token');
    const authToken = token || adminToken || userToken;
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  }

  // ==================== ANIMALS ====================
  async getAnimals(params?: {
    type?: string;
    breed?: string;
    status?: string;
    featured?: boolean;
    search?: string;
  }): Promise<Animal[]> {
    try {
      const query = new URLSearchParams();
      if (params?.type && params.type !== 'all') query.append('type', params.type);
      if (params?.breed && params.breed !== 'all') query.append('breed', params.breed);
      if (params?.status && params.status !== 'all') query.append('status', params.status);
      if (params?.featured !== undefined) query.append('featured', String(params.featured));
      if (params?.search) query.append('search', params.search);

      const res = await fetch(`${API_BASE}/animals?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch animals');
      const json = await res.json();
      return json.data || [];
    } catch (error) {
      console.warn('API getAnimals failed, fallback to empty:', error);
      return [];
    }
  }

  async getAnimalById(id: string): Promise<Animal | null> {
    try {
      const res = await fetch(`${API_BASE}/animals/${id}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (error) {
      console.error('API getAnimalById error:', error);
      return null;
    }
  }

  async createAnimal(animal: Partial<Animal>, token?: string): Promise<{ success: boolean; data?: Animal; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/animals`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify(animal)
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create animal' };
    }
  }

  async uploadAnimalImage(file: File, token?: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API_BASE}/animals/upload-image`, {
        method: 'POST',
        headers: this.getHeaders(token, false),
        body: formData
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to upload animal image' };
    }
  }

  async updateAnimal(id: string, updates: Partial<Animal>, token?: string): Promise<{ success: boolean; data?: Animal; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/animals/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(token),
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update animal' };
    }
  }

  async deleteAnimal(id: string, token?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/animals/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(token)
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete animal' };
    }
  }

  // ==================== PACKAGES ====================
  async getPackagesData(): Promise<{
    catalog: PackageCatalogItem[];
    preMadePackages: PreMadePackage[];
    rules: { minCategoriesForFreeDelivery: number; freeDelivery: boolean; reservationDepositPercent: number };
  }> {
    try {
      const res = await fetch(`${API_BASE}/packages`);
      if (!res.ok) throw new Error('Failed to fetch packages');
      return await res.json();
    } catch (error) {
      console.error('Error fetching packages data:', error);
      return {
        catalog: [],
        preMadePackages: [],
        rules: { minCategoriesForFreeDelivery: 3, freeDelivery: true, reservationDepositPercent: 50 }
      };
    }
  }

  async getSavedPackages(token?: string): Promise<SavedPackage[]> {
    try {
      const res = await fetch(`${API_BASE}/packages/saved`, {
        headers: this.getHeaders(token)
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch (error) {
      console.error('Error fetching saved packages:', error);
      return [];
    }
  }

  async savePackage(data: { name: string; description?: string; items: PackageCatalogItem[]; totalPrice: number }, token?: string): Promise<{ success: boolean; data?: SavedPackage; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/packages/saved`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to save package' };
    }
  }

  async deleteSavedPackage(id: string, token?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/packages/saved/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(token)
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete saved package' };
    }
  }

  // ==================== AUTH ====================
  async register(name: string, email: string, phone: string, password: string): Promise<{ success: boolean; token?: string; user?: UserProfile; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error during registration' };
    }
  }

  async sendRegistrationOtp(name: string, email: string, phone: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/send-registration-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone })
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error sending verification code' };
    }
  }

  async verifyRegistrationOtp(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    otp: string;
  }): Promise<{ success: boolean; token?: string; user?: UserProfile; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/verify-registration-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error verifying code' };
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; token?: string; user?: UserProfile; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error during login' };
    }
  }

  async getMe(token?: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: this.getHeaders(token)
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== ORDERS & RESERVATIONS ====================
  async submitOrderWithSlip(formData: FormData, token?: string): Promise<{ success: boolean; message?: string; order?: Order; error?: string }> {
    try {
      const headers: Record<string, string> = {};
      const authToken = token || localStorage.getItem('jonny_user_token') || localStorage.getItem('jonny_admin_token');
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers,
        body: formData
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to submit order' };
    }
  }

  async submitFinalPayment(orderId: string, formData: FormData, token?: string): Promise<{ success: boolean; message?: string; order?: Order; error?: string }> {
    try {
      const headers: Record<string, string> = {};
      const authToken = token || localStorage.getItem('jonny_user_token') || localStorage.getItem('jonny_admin_token');
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch(`${API_BASE}/orders/${orderId}/final-payment`, {
        method: 'POST',
        headers,
        body: formData
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to submit final payment' };
    }
  }

  async getMyOrders(token?: string): Promise<Order[]> {
    try {
      const res = await fetch(`${API_BASE}/orders/my-orders`, {
        headers: this.getHeaders(token)
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  }

  async getReservations(token?: string): Promise<Order[]> {
    try {
      const res = await fetch(`${API_BASE}/orders/reservations`, {
        headers: this.getHeaders(token)
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch (error) {
      console.error('Error fetching reservations:', error);
      return [];
    }
  }

  async getAllOrders(token?: string, status?: string): Promise<Order[]> {
    try {
      const query = status && status !== 'all' ? `?status=${status}` : '';
      const res = await fetch(`${API_BASE}/orders${query}`, {
        headers: this.getHeaders(token)
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return [];
    }
  }

  async getOrderById(orderId: string, token?: string): Promise<{ success: boolean; data?: Order; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}`, {
        headers: this.getHeaders(token)
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch order' };
    }
  }

  async verifyReservation(orderId: string, adminNotes?: string, token?: string): Promise<{ success: boolean; message?: string; order?: Order; animal?: Animal; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/verify-reservation`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({ adminNotes })
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to verify reservation' };
    }
  }

  async verifyFinalPayment(orderId: string, adminNotes?: string, token?: string): Promise<{ success: boolean; message?: string; order?: Order; animal?: Animal; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/verify-final`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({ adminNotes })
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to verify final payment' };
    }
  }

  async verifyOrder(orderId: string, adminNotes?: string, token?: string): Promise<{ success: boolean; message?: string; order?: Order; animal?: Animal; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/verify`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({ adminNotes })
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to verify order' };
    }
  }

  async rejectOrder(orderId: string, reason: string, token?: string): Promise<{ success: boolean; message?: string; order?: Order; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/reject`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({ reason })
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to reject order' };
    }
  }

  async updateOrderStatus(orderId: string, status: string, adminNotes?: string, token?: string): Promise<{ success: boolean; message?: string; order?: Order; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({ status, adminNotes })
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update order status' };
    }
  }

  // ==================== NOTIFICATIONS ====================
  async getNotifications(token?: string): Promise<{ unreadCount: number; data: AdminNotification[] }> {
    try {
      const res = await fetch(`${API_BASE}/admin/notifications`, {
        headers: this.getHeaders(token)
      });
      if (!res.ok) return { unreadCount: 0, data: [] };
      const json = await res.json();
      return { unreadCount: json.unreadCount || 0, data: json.data || [] };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { unreadCount: 0, data: [] };
    }
  }

  async markNotificationRead(id: string, token?: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/admin/notifications/${id}/read`, {
        method: 'PUT',
        headers: this.getHeaders(token)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ==================== SETTINGS & BANK ACCOUNTS ====================
  async getBankAccounts(): Promise<BankAccount[]> {
    try {
      const res = await fetch(`${API_BASE}/settings/bank-accounts`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      return [];
    }
  }

  async getBusinessSettings(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/settings/business`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (error) {
      console.error('Error fetching business settings:', error);
      return null;
    }
  }
}

export const api = new ApiService();
