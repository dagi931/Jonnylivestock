import { Response } from 'express';
import { RealtimeEvent, RealtimeEventType } from '../types/index.js';

interface ClientConnection {
  id: string;
  res: Response;
  role?: 'customer' | 'admin';
  userId?: string;
}

class RealtimeService {
  private clients: ClientConnection[] = [];
  private heartbeatTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startHeartbeat();
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      this.clients.forEach(client => {
        try {
          client.res.write(': keepalive\n\n');
        } catch {
          this.removeClient(client.id);
        }
      });
    }, 20000);
  }

  public addClient(res: Response, clientInfo?: { userId?: string; role?: 'customer' | 'admin' }): string {
    const clientId = `CLIENT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const connection: ClientConnection = {
      id: clientId,
      res,
      role: clientInfo?.role,
      userId: clientInfo?.userId
    };

    this.clients.push(connection);

    // Initial greeting event
    const initialEvent: RealtimeEvent = {
      type: 'CONNECTED',
      payload: { clientId, message: 'Connected to Jonny Livestock Realtime Event Stream' },
      timestamp: new Date().toISOString()
    };
    res.write(`data: ${JSON.stringify(initialEvent)}\n\n`);

    console.log(`[Realtime] Client connected: ${clientId} (Total active: ${this.clients.length})`);
    return clientId;
  }

  public removeClient(clientId: string): void {
    const initialCount = this.clients.length;
    this.clients = this.clients.filter(c => c.id !== clientId);
    if (this.clients.length !== initialCount) {
      console.log(`[Realtime] Client disconnected: ${clientId} (Total active: ${this.clients.length})`);
    }
  }

  public broadcast<T = any>(type: RealtimeEventType, payload: T): void {
    const event: RealtimeEvent<T> = {
      type,
      payload,
      timestamp: new Date().toISOString()
    };

    const message = `data: ${JSON.stringify(event)}\n\n`;
    console.log(`[Realtime Broadcast] ${type}`, payload ? Object.keys(payload) : '');

    this.clients.forEach(client => {
      try {
        client.res.write(message);
      } catch (err) {
        console.error(`[Realtime] Failed to send to client ${client.id}:`, err);
        this.removeClient(client.id);
      }
    });
  }

  public getConnectedClientsCount(): number {
    return this.clients.length;
  }
}

export const realtimeService = new RealtimeService();
