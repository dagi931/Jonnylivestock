import { useState, useEffect } from 'react';
import { Animal, AnimalType } from '../types/animal';
import { api } from '../services/api';
import { useRealtimeEvent } from '../context/RealtimeContext';

// Fast in-memory cache to guarantee 0ms instant page loads and zero layout shift on subsequent navigation
const animalCache = new Map<string, { data: Animal[]; timestamp: number }>();

export function useAnimals(type?: AnimalType) {
  const cacheKey = type || 'all';

  const getCachedAnimals = (): Animal[] => {
    const cached = animalCache.get(cacheKey);
    if (cached) return cached.data;
    return [];
  };

  const [animals, setAnimals] = useState<Animal[]>(getCachedAnimals);
  const [isLoading, setIsLoading] = useState<boolean>(() => getCachedAnimals().length === 0);

  useEffect(() => {
    let isMounted = true;

    const fetchLive = async () => {
      try {
        const liveAnimals = await api.getAnimals({ type });
        if (isMounted && liveAnimals && Array.isArray(liveAnimals)) {
          const sorted = [...liveAnimals].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          animalCache.set(cacheKey, { data: sorted, timestamp: Date.now() });
          setAnimals(sorted);
        }
      } catch (err) {
        console.warn('Could not fetch live animals:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLive();

    return () => {
      isMounted = false;
    };
  }, [type, cacheKey]);

  // 🚀 Realtime listener for animal updates (e.g. status becomes sold, reserved, quantity reduced)
  useRealtimeEvent<Animal>('ANIMAL_UPDATED', (updatedAnimal) => {
    if (!updatedAnimal || !updatedAnimal.id) return;
    setAnimals(prev => {
      const index = prev.findIndex(a => a.id.toLowerCase() === updatedAnimal.id.toLowerCase());
      if (index === -1) return prev;
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updatedAnimal };
      animalCache.set(cacheKey, { data: copy, timestamp: Date.now() });
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
      const updated = [newAnimal, ...prev];
      animalCache.set(cacheKey, { data: updated, timestamp: Date.now() });
      return updated;
    });
  });

  // 🚀 Realtime listener for deleted animals
  useRealtimeEvent<{ id: string }>('ANIMAL_DELETED', ({ id }) => {
    if (!id) return;
    setAnimals(prev => {
      const filtered = prev.filter(a => a.id.toLowerCase() !== id.toLowerCase());
      animalCache.set(cacheKey, { data: filtered, timestamp: Date.now() });
      return filtered;
    });
  });

  // 🚀 Realtime listener for verified orders (mark animal sold / reduce stock)
  useRealtimeEvent<{ order: any; animal: Animal | null }>('ORDER_VERIFIED', (data) => {
    if (data?.animal) {
      setAnimals(prev => {
        const index = prev.findIndex(a => a.id.toLowerCase() === data.animal!.id.toLowerCase());
        if (index === -1) return prev;
        const copy = [...prev];
        copy[index] = { ...copy[index], ...data.animal };
        animalCache.set(cacheKey, { data: copy, timestamp: Date.now() });
        return copy;
      });
    }
  });

  const breeds = Array.from(new Set(animals.map(a => a.breed)));

  return { animals, isLoading, breeds };
}
