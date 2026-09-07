import { useState, useEffect } from 'react';
import { Animal, AnimalType } from '../types/animal';
import { mockAnimals, updateMockAnimalStatus } from '../data/animals';
import { api } from '../services/api';
import { useRealtimeEvent } from '../context/RealtimeContext';

export function useAnimals(type?: AnimalType) {
  const [animals, setAnimals] = useState<Animal[]>(() => {
    if (type) return mockAnimals.filter(a => a.type === type);
    return mockAnimals;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial animals from backend API
  useEffect(() => {
    let isMounted = true;
    api.getAnimals({ type }).then((liveAnimals) => {
      if (isMounted && liveAnimals && liveAnimals.length > 0) {
        liveAnimals.forEach(a => updateMockAnimalStatus(a.id, a.status));
        setAnimals(liveAnimals);
      }
      if (isMounted) setIsLoading(false);
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
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
