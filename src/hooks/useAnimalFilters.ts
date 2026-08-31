import { useState, useMemo } from 'react';
import { Animal, AnimalFilterOptions, SortOption } from '../types/animal';

const initialFilters: AnimalFilterOptions = {
  searchQuery: '',
  breed: 'all',
  gender: 'all',
  minWeight: null,
  maxWeight: null,
  minPrice: null,
  maxPrice: null,
  status: 'all',
  sortBy: 'newest'
};

export const useAnimalFilters = (animals: Animal[]) => {
  const [filters, setFilters] = useState<AnimalFilterOptions>(initialFilters);

  const updateFilter = <K extends keyof AnimalFilterOptions>(
    key: K,
    value: AnimalFilterOptions[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const isFiltered = useMemo(() => {
    return (
      filters.searchQuery !== '' ||
      filters.breed !== 'all' ||
      filters.gender !== 'all' ||
      filters.minWeight !== null ||
      filters.maxWeight !== null ||
      filters.minPrice !== null ||
      filters.maxPrice !== null ||
      filters.status !== 'all' ||
      filters.sortBy !== 'newest'
    );
  }, [filters]);

  const filteredAnimals = useMemo(() => {
    let result = [...animals];

    // Search query: breed, ID, location, color
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.breed.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          a.color.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      );
    }

    // Breed filter
    if (filters.breed && filters.breed !== 'all') {
      result = result.filter(
        (a) => a.breed.toLowerCase() === filters.breed.toLowerCase()
      );
    }

    // Gender filter
    if (filters.gender && filters.gender !== 'all') {
      result = result.filter(
        (a) => a.gender.toLowerCase() === filters.gender.toLowerCase()
      );
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      result = result.filter((a) => a.status === filters.status);
    }

    // Weight range filter
    if (filters.minWeight !== null && filters.minWeight !== undefined) {
      result = result.filter((a) => a.weight >= (filters.minWeight as number));
    }
    if (filters.maxWeight !== null && filters.maxWeight !== undefined) {
      result = result.filter((a) => a.weight <= (filters.maxWeight as number));
    }

    // Price range filter
    if (filters.minPrice !== null && filters.minPrice !== undefined) {
      result = result.filter((a) => a.price >= (filters.minPrice as number));
    }
    if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
      result = result.filter((a) => a.price <= (filters.maxPrice as number));
    }

    // Sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'weight-asc':
          return a.weight - b.weight;
        case 'weight-desc':
          return b.weight - a.weight;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [animals, filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    isFiltered,
    filteredAnimals,
    totalCount: animals.length,
    filteredCount: filteredAnimals.length,
    setSortBy: (sortBy: SortOption) => updateFilter('sortBy', sortBy)
  };
};
