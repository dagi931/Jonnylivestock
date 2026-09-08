import { useState, useEffect } from 'react';
import { Animal, AnimalType } from '../types/animal';
import { mockAnimals, updateMockAnimalStatus } from '../data/animals';
import { api } from '../services/api';
import { useRealtimeEvent } from '../context/RealtimeContext';

export function useAnimals(type?: AnimalType) {
  const getInitialAnimals = () => {
    const list = type ? mockAnimals.filter(a => a.type === type) : mockAnimals;
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const [animals, setAnimals] = useState<Animal[]>(getInitialAnimals);
  // If mock animals exist, render immediately to avoid delaying FCP/LCP with skeletons
  const [isLoading, setIsLoading] = useState<boolean>(() => getInitialAnimals().length === 0);

  // Fetch initial animals from backend API - defer slightly if initial mock animals exist to protect FCP/LCP
  useEffect(() => {
    let isMounted = true;
    let timerId: any;

    const syncAnimals = () => {
      api.getAnimals({ type }).then((liveAnimals) => {
        if (isMounted && liveAnimals && liveAnimals.length > 0) {
          liveAnimals.forEach(a => updateMockAnimalStatus(a.id, a.status));
          const sorted = [...liveAnimals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setAnimals(prev => {
            if (prev.length === sorted.length) {
              const identical = prev.every((a, i) => {
                const s = sorted[i];
                return s && a.id === s.id && a.status === s.status && a.quantity === s.quantity && a.price === s.price;
              });
              if (identical) return prev;
            }
            return sorted;
          });
        }
        if (isMounted) setIsLoading(false);
      }).catch(() => {
        if (isMounted) setIsLoading(false);
      });
    };

    const hasInitial = getInitialAnimals().length > 0;
    if (hasInitial && typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      timerId = (window as any).requestIdleCallback(syncAnimals, { timeout: 2500 });
    } else if (hasInitial) {
      timerId = setTimeout(syncAnimals, 1000);
    } else {
      syncAnimals();
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined' && 'cancelIdleCallback' in window && typeof timerId === 'number') {
        (window as any).cancelIdleCallback(timerId);
      } else if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [type]);

  // 🚀 Realtime listener for animal updates (e.g. status becomes sold, reserved, quantity reduced)
  useRealtimeEvent<Animal>('ANIMAL_UPDATED', (updatedAnimal) => {
    if (!updatedAnimal || !updatedAnimal.id) return;
    updateMockAnimalStatus(updatedAnimal.id, updatedAnimal.status);
    setAnimals(prev => {
      const index = prev.findIndex(a => a.id.toLowerCase() === updatedAnimal.id.toLowerCase());
      if (index === -1) return prev;
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updatedAnimal };
      return copy;
    });
  });

  // 🚀 Realtime listener for newly created animals
  useRealtimeEvent<Animal>('ANIMAL_CREATED', (newAnimal) => {
    if (!newAnimal || !newAnimal.id) return;
    if (type && newAnimal.type !== type) return;
    setAnimals(prev => {
      const exists = prev.some(a => a.id.toLowerCase() === newAnimal.id.toLowerCase());
      if (exists) return prev;
      return [newAnimal, ...prev];
    });
  });

  // 🚀 Realtime listener for deleted animals
  useRealtimeEvent<{ id: string }>('ANIMAL_DELETED', ({ id }) => {
    if (!id) return;
    setAnimals(prev => prev.filter(a => a.id.toLowerCase() !== id.toLowerCase()));
  });

  // 🚀 Realtime listener for verified orders (mark animal sold / reduce stock)
  useRealtimeEvent<{ order: any; animal: Animal | null }>('ORDER_VERIFIED', (data) => {
    if (data?.animal) {
      setAnimals(prev => {
        const index = prev.findIndex(a => a.id.toLowerCase() === data.animal!.id.toLowerCase());
        if (index === -1) return prev;
        const copy = [...prev];
        copy[index] = { ...copy[index], ...data.animal };
        return copy;
      });
    }
  });

  const breeds = Array.from(new Set(animals.map(a => a.breed)));

  return { animals, isLoading, breeds };
}
