import { Animal, ContactMessage, ContactFormData } from '../types/animal';
import { PackageCatalogItem, PreMadePackage, SavedPackage, Order } from '../types/package';
import { PACKAGE_CATALOG, PRE_MADE_PACKAGES } from '../data/packagesData';

export type { Order, ContactMessage, ContactFormData };

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
    | 'OUT_OF_STOCK'
    | 'CONTACT_MESSAGE'
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
  private getLocalPackageSlots(): Record<string, { availableSlots: number; totalSlots: number }> {
    try {
      const stored = localStorage.getItem('jonny_package_slots');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  public setLocalPackageSlot(id: string, availableSlots: number, totalSlots?: number): void {
    try {
      const current = this.getLocalPackageSlots();
      const existingTotal = current[id]?.totalSlots || 10;
      current[id] = {
        availableSlots: Math.max(0, availableSlots),
        totalSlots: totalSlots !== undefined ? totalSlots : existingTotal
      };
      localStorage.setItem('jonny_package_slots', JSON.stringify(current));
    } catch (e) {
      console.error('Failed to save local package slot:', e);
    }
  }

  async getPackagesData(): Promise<{
    catalog: PackageCatalogItem[];
    preMadePackages: PreMadePackage[];
    rules: { minCategoriesForFreeDelivery: number; freeDelivery: boolean; reservationDepositPercent: number };
  }> {
    try {
      const res = await fetch(`${API_BASE}/packages`);
      if (!res.ok) throw new Error('Failed to fetch packages');
      const json = await res.json();
      if (json && json.preMadePackages) {
        json.preMadePackages = json.preMadePackages.map((p: PreMadePackage) => ({
          ...p,
          badge: (p.badge && p.badge.toLowerCase().includes('cook')) ? undefined : p.badge
        }));
      }
      return json;
    } catch (error) {
      console.warn('Using local fallback for packages data:', error);
      const slotMap = this.getLocalPackageSlots();
      const mappedPackages = PRE_MADE_PACKAGES.map(p => {
        const override = slotMap[p.id];
        const totalSlots = override ? override.totalSlots : (p.totalSlots ?? 10);
        const availableSlots = override ? override.availableSlots : (p.availableSlots ?? totalSlots);
        const isOutOfStock = availableSlots <= 0;
        return {
          ...p,
          totalSlots,
          availableSlots,
          isOutOfStock
        };
      });

      return {
        catalog: PACKAGE_CATALOG,
        preMadePackages: mappedPackages,
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

  async createPackage(data: {
    name: string;
    amharicName?: string;
    tagline?: string;
    description: string;
    items: PackageCatalogItem[];
    originalPrice: number;
    packagePrice: number;
    badge?: string;
    image: string;
    featured?: boolean;
    totalSlots?: number;
    availableSlots?: number;
  }, token?: string): Promise<{ success: boolean; message?: string; data?: PreMadePackage; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/packages`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create package' };
    }
  }

  async updatePackageSlots(
    id: string,
    availableSlots: number,
    totalSlots?: number,
    token?: string
  ): Promise<{ success: boolean; message?: string; data?: PreMadePackage; error?: string }> {
    this.setLocalPackageSlot(id, availableSlots, totalSlots);
    try {
      const res = await fetch(`${API_BASE}/packages/${id}/slots`, {
        method: 'PATCH',
        headers: this.getHeaders(token),
        body: JSON.stringify({ availableSlots, totalSlots })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    const pkg = PRE_MADE_PACKAGES.find(p => p.id === id);
    return {
      success: true,
      message: 'Package slots updated successfully',
      data: pkg ? {
        ...pkg,
        availableSlots: Math.max(0, availableSlots),
        totalSlots: totalSlots || pkg.totalSlots || 10,
        isOutOfStock: availableSlots <= 0
      } : undefined
    };
  }

  async deletePackage(id: string, token?: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/packages/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(token)
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete package' };
    }
  }

  async uploadPackageImage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API_BASE}/packages/upload-image`, {
        method: 'POST',
        body: formData
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to upload package image' };
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

  async sendForgotPasswordOtp(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/send-forgot-password-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error sending password reset code' };
    }
  }

  async resetPasswordWithOtp(data: {
    email: string;
    otp: string;
    newPassword: string;
  }): Promise<{ success: boolean; token?: string; user?: UserProfile; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password-with-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error resetting password' };
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
      const result = await res.json();
      if (result.success) {
        // Also update local slot state in case frontend is running on local fallback
        const isPackage = formData.get('isPackage') === 'true';
        const packageName = formData.get('packageName') as string | null;
        if (isPackage || packageName) {
          const pkg = PRE_MADE_PACKAGES.find(p => p.name === packageName);
          if (pkg) {
            const currentSlots = this.getLocalPackageSlots()[pkg.id]?.availableSlots ?? (pkg.availableSlots ?? 10);
            const newSlots = Math.max(0, currentSlots - 1);
            this.setLocalPackageSlot(pkg.id, newSlots, pkg.totalSlots ?? 10);
            if (newSlots === 0) {
              this.createLocalAdminNotification({
                id: `NOTIF-${Date.now().toString().slice(-6)}`,
                type: 'OUT_OF_STOCK',
                title: 'Package Out of Stock',
                message: `Package "${pkg.name}" has reached 0 available slots and is now completely OUT OF STOCK!`,
                read: false,
                createdAt: new Date().toISOString()
              });
            }
          }
        }
      }
      return result;
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
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        console.warn(`[Orders API] Failed to fetch orders (HTTP ${res.status}):`, errJson?.error || res.statusText);
        if (res.status === 401 || res.status === 403) {
          window.dispatchEvent(new CustomEvent('auth_expired', { detail: { reason: errJson?.error } }));
        }
        return [];
      }
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
  private getLocalNotifications(): AdminNotification[] {
    try {
      const stored = localStorage.getItem('jonny_local_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public createLocalAdminNotification(notif: AdminNotification): void {
    try {
      const current = this.getLocalNotifications();
      const updated = [notif, ...current];
      localStorage.setItem('jonny_local_notifications', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save local notification:', e);
    }
  }

  async getNotifications(token?: string): Promise<{ unreadCount: number; data: AdminNotification[] }> {
    try {
      const res = await fetch(`${API_BASE}/admin/notifications`, {
        headers: this.getHeaders(token)
      });
      if (!res.ok) throw new Error('Failed to fetch remote notifications');
      const json = await res.json();
      const serverData: AdminNotification[] = json.data || [];

      // Merge any local notifications that haven't been synced
      const localData = this.getLocalNotifications();
      const serverIds = new Set(serverData.map(n => n.id));
      const extraLocal = localData.filter(n => !serverIds.has(n.id));
      const combined = [...extraLocal, ...serverData];
      const unreadCount = combined.filter(n => !n.read).length;

      return { unreadCount, data: combined };
    } catch (error) {
      console.warn('Using local fallback notifications:', error);
      const localData = this.getLocalNotifications();
      const unreadCount = localData.filter(n => !n.read).length;
      return { unreadCount, data: localData };
    }
  }

  async markNotificationRead(id: string, token?: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/admin/notifications/${id}/read`, {
        method: 'PUT',
        headers: this.getHeaders(token)
      });
      if (res.ok) {
        // Also mark local
        const local = this.getLocalNotifications();
        localStorage.setItem(
          'jonny_local_notifications',
          JSON.stringify(local.map(n => n.id === id ? { ...n, read: true } : n))
        );
        return true;
      }
    } catch {}

    const local = this.getLocalNotifications();
    localStorage.setItem(
      'jonny_local_notifications',
      JSON.stringify(local.map(n => n.id === id ? { ...n, read: true } : n))
    );
    return true;
  }

  // ==================== CONTACT US MESSAGES ====================
  private getLocalContactMessages(): ContactMessage[] {
    try {
      const stored = localStorage.getItem('jonny_local_contact_messages');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveLocalContactMessage(msg: ContactMessage): void {
    try {
      const current = this.getLocalContactMessages();
      const updated = [msg, ...current.filter(m => m.id !== msg.id)];
      localStorage.setItem('jonny_local_contact_messages', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save local contact message:', e);
    }
  }

  async submitContactMessage(data: ContactFormData): Promise<{ success: boolean; message?: string; error?: string; data?: ContactMessage }> {
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          this.saveLocalContactMessage(json.data);
        }
        return json;
      }
      throw new Error('Server returned non-200');
    } catch (error: any) {
      // Local fallback for smooth offline / preview testing
      const fallbackMsg: ContactMessage = {
        id: `MSG-${Date.now().toString().slice(-6)}`,
        name: data.name,
        phone: data.phone,
        email: data.email,
        animalId: data.animalId,
        serviceNeeded: data.serviceNeeded,
        message: data.message,
        read: false,
        createdAt: new Date().toISOString()
      };
      this.saveLocalContactMessage(fallbackMsg);

      // Create local admin notification
      this.createLocalAdminNotification({
        id: `NOTIF-${Date.now().toString().slice(-6)}`,
        type: 'CONTACT_MESSAGE',
        title: 'New Contact Message Received',
        message: `Inquiry from ${data.name} (${data.phone}): "${data.message.slice(0, 75)}..."`,
        read: false,
        createdAt: new Date().toISOString()
      });

      return {
        success: true,
        message: 'Your message has reached Jonny Livestock administration. We will contact you promptly.',
        data: fallbackMsg
      };
    }
  }

  async getContactMessages(token?: string): Promise<ContactMessage[]> {
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        headers: this.getHeaders(token)
      });
      if (res.ok) {
        const json = await res.json();
        const serverMsgs: ContactMessage[] = json.data || [];
        const localMsgs = this.getLocalContactMessages();
        const serverIds = new Set(serverMsgs.map(m => m.id));
        const extraLocal = localMsgs.filter(m => !serverIds.has(m.id));
        return [...extraLocal, ...serverMsgs];
      }
      throw new Error('Failed to fetch from server');
    } catch {
      return this.getLocalContactMessages();
    }
  }

  async markContactMessageRead(id: string, token?: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/contact/${id}/read`, {
        method: 'PUT',
        headers: this.getHeaders(token)
      });
      if (res.ok) {
        const local = this.getLocalContactMessages();
        localStorage.setItem(
          'jonny_local_contact_messages',
          JSON.stringify(local.map(m => m.id === id ? { ...m, read: true } : m))
        );
        return true;
      }
    } catch {}

    const local = this.getLocalContactMessages();
    localStorage.setItem(
      'jonny_local_contact_messages',
      JSON.stringify(local.map(m => m.id === id ? { ...m, read: true } : m))
    );
    return true;
  }

  async deleteContactMessage(id: string, token?: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/contact/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(token)
      });
      if (res.ok) {
        const local = this.getLocalContactMessages();
        localStorage.setItem(
          'jonny_local_contact_messages',
          JSON.stringify(local.filter(m => m.id !== id))
        );
        return true;
      }
    } catch {}

    const local = this.getLocalContactMessages();
    localStorage.setItem(
      'jonny_local_contact_messages',
      JSON.stringify(local.filter(m => m.id !== id))
    );
    return true;
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

  // ==================== RAW MEAT PRICING ====================
  async getMeatPricing(): Promise<{
    kurtPrice: number;
    kitfoPrice: number;
    tibsWotPrice: number;
    available?: boolean;
    updatedAt?: string;
  }> {
    try {
      const res = await fetch(`${API_BASE}/settings/meat-pricing`);
      if (!res.ok) throw new Error('Failed to fetch meat pricing');
      const json = await res.json();
      return json.data || { kurtPrice: 2500, kitfoPrice: 2200, tibsWotPrice: 1800, available: true };
    } catch {
      return { kurtPrice: 2500, kitfoPrice: 2200, tibsWotPrice: 1800, available: true };
    }
  }

  async updateMeatPricing(
    pricing: { kurtPrice: number; kitfoPrice: number; tibsWotPrice: number; available?: boolean },
    token?: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/settings/meat-pricing`, {
        method: 'PUT',
        headers: this.getHeaders(token),
        body: JSON.stringify(pricing)
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update meat pricing' };
    }
  }

  // ==================== DELIVERY & LOGISTICS ====================
  async getDeliveryQuote(params: {
    deliveryAddress?: string;
    deliveryLat: number;
    deliveryLng: number;
    items: Array<{ type: string; name?: string; quantity: number; weightKg?: number }>;
  }): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/delivery/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return await res.json();
    } catch (error: any) {
      console.error('Error fetching delivery quote:', error);
      return {
        success: false,
        error: error.message || 'Failed to calculate delivery quote'
      };
    }
  }

  async getDeliveryConfig(): Promise<{
    success: boolean;
    settings?: any;
    vehicles?: any[];
    error?: string;
  }> {
    try {
      const res = await fetch(`${API_BASE}/delivery/config`);
      if (!res.ok) throw new Error('Failed to fetch delivery config');
      return await res.json();
    } catch (error: any) {
      console.error('Error fetching delivery config:', error);
      return { success: false, error: error.message };
    }
  }

  async updateDeliveryConfig(
    data: { settings?: any; vehicles?: any[] },
    token?: string
  ): Promise<{ success: boolean; message?: string; settings?: any; vehicles?: any[]; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/delivery/config`, {
        method: 'PUT',
        headers: this.getHeaders(token),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update delivery config' };
    }
  }

  async testDeliveryRoute(
    pickupLat: number,
    pickupLng: number,
    deliveryLat: number,
    deliveryLng: number,
    token?: string
  ): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/delivery/test-route`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({ pickupLat, pickupLng, deliveryLat, deliveryLng })
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async approveDelivery(
    orderId: string,
    status: 'delivery_pending' | 'delivered' = 'delivery_pending',
    adminNotes?: string,
    token?: string
  ): Promise<{ success: boolean; message?: string; order?: Order; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/approve-delivery`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({ status, adminNotes })
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to approve delivery' };
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<{
    success: boolean;
    data?: {
      address: string;
      subCity?: string;
      road?: string;
      neighborhood?: string;
      display_name?: string;
    };
    error?: string;
  }> {
    try {
      const res = await fetch(`${API_BASE}/delivery/reverse-geocode?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error('Failed to reverse geocode location');
      return await res.json();
    } catch (error: any) {
      console.error('Error reverse geocoding:', error);
      return { success: false, error: error.message };
    }
  }

  async searchPlaces(query: string): Promise<{
    success: boolean;
    data?: Array<{
      name: string;
      address: string;
      subCity?: string;
      lat: number;
      lng: number;
    }>;
    error?: string;
  }> {
    try {
      const res = await fetch(`${API_BASE}/delivery/search-places?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Failed to search places');
      return await res.json();
    } catch (error: any) {
      console.error('Error searching places:', error);
      return { success: false, error: error.message };
    }
  }

  async getDeliveryRoute(lat: number, lng: number): Promise<{
    success: boolean;
    data?: {
      distanceKm: number;
      estimatedDurationMinutes: number;
      isFallback: boolean;
      routeCoordinates?: [number, number][];
      isWithinRange: boolean;
      distanceCategory: string;
      distanceCategoryLabel: string;
      amharicCategoryLabel: string;
      pickupLocation: {
        lat: number;
        lng: number;
        address: string;
      };
    };
    error?: string;
  }> {
    try {
      const res = await fetch(`${API_BASE}/delivery/route?lat=${lat}&lng=${lng}`);
      if (!res.ok) throw new Error('Failed to fetch driving route');
      return await res.json();
    } catch (error: any) {
      console.error('Error fetching delivery route:', error);
      return { success: false, error: error.message };
    }
  }
}

export const api = new ApiService();
