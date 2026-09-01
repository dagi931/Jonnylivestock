import { useState, useEffect } from 'react';
import { Animal, AnimalType } from '../types/animal';
import { mockAnimals } from '../data/animals';
import { api } from '../services/api';

export function useAnimals(type?: AnimalType) {
  const [animals, setAnimals] = useState<Animal[]>(() => {
    if (type) return mockAnimals.filter(a => a.type === type);
    return mockAnimals;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api.getAnimals({ type }).then((liveAnimals) => {
      if (isMounted && liveAnimals && liveAnimals.length > 0) {
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

  const breeds = Array.from(new Set(animals.map(a => a.breed)));

  return { animals, isLoading, breeds };
}
