import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';

export type RealtimeEventType =
  | 'CONNECTED'
  | 'HEARTBEAT'
  | 'NEW_ORDER_SLIP'
  | 'NEW_RESERVATION_DEPOSIT'
  | 'FINAL_PAYMENT_SLIP'
  | 'RESERVATION_APPROVED'
  | 'FINAL_PAYMENT_APPROVED'
  | 'ORDER_VERIFIED'
  | 'ORDER_REJECTED'
  | 'ORDER_UPDATED'
  | 'DELIVERY_APPROVED'
  | 'ANIMAL_UPDATED'
  | 'ANIMAL_CREATED'
  | 'ANIMAL_DELETED'
  | 'NOTIFICATION_CREATED'
  | 'NOTIFICATIONS_READ';

export interface RealtimeEvent<T = any> {
  type: RealtimeEventType;
  payload: T;
  timestamp: string;
}

interface RealtimeContextValue {
  isConnected: boolean;
  lastEvent: RealtimeEvent | null;
  subscribe: (eventType: RealtimeEventType, handler: (payload: any) => void) => () => void;
  playNotificationSound: () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const handlersRef = useRef<Map<RealtimeEventType, Set<(payload: any) => void>>>(new Map());
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Play gentle notification sound using Web Audio API (no external file dependency)
  const playNotificationSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // Audio context might be restricted before user interaction
    }
  }, []);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const token = localStorage.getItem('jonny_admin_token') || localStorage.getItem('jonny_user_token');
    const url = token ? `/api/events?token=${encodeURIComponent(token)}` : '/api/events';

    try {
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
      };

      es.onmessage = (e) => {
        try {
          const event: RealtimeEvent = JSON.parse(e.data);
          setLastEvent(event);

          // Dispatch to type-specific handlers
          const typeHandlers = handlersRef.current.get(event.type);
          if (typeHandlers) {
            typeHandlers.forEach(handler => handler(event.payload));
          }

          // Also play sound for new order slips if on admin
          if (event.type === 'NEW_ORDER_SLIP') {
            playNotificationSound();
          }
        } catch (err) {
          console.error('[Realtime] Failed to parse event data:', err);
        }
      };

      es.onerror = () => {
        setIsConnected(false);
        es.close();
        // Exponential / delayed reconnection attempt
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      };
    } catch (err) {
      console.error('[Realtime] EventSource connection error:', err);
    }
  }, [playNotificationSound]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const subscribe = useCallback((eventType: RealtimeEventType, handler: (payload: any) => void) => {
    if (!handlersRef.current.has(eventType)) {
      handlersRef.current.set(eventType, new Set());
    }
    const handlers = handlersRef.current.get(eventType)!;
    handlers.add(handler);

    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        handlersRef.current.delete(eventType);
      }
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ isConnected, lastEvent, subscribe, playNotificationSound }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

export const useRealtimeEvent = <T = any>(eventType: RealtimeEventType, handler: (payload: T) => void) => {
  const { subscribe } = useRealtime();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = subscribe(eventType, (payload) => {
      if (handlerRef.current) {
        handlerRef.current(payload);
      }
    });

    return unsubscribe;
  }, [eventType, subscribe]);
};
