import { Router, Request, Response } from 'express';
import { JsonDB } from '../db/jsonDb.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.middleware.js';
import { Animal, AnimalType } from '../types/index.js';
import { realtimeService } from '../services/realtime.service.js';

const router = Router();

// ==================== GET ALL ANIMALS (with filters) ====================
router.get('/', (req: Request, res: Response): void => {
  try {
    const { type, breed, minPrice, maxPrice, minWeight, maxWeight, status, featured, search } = req.query;

    let animals = JsonDB.getAnimals();

    if (type && typeof type === 'string' && type !== 'all') {
      animals = animals.filter(a => a.type === type);
    }

    if (breed && typeof breed === 'string' && breed !== 'all') {
      animals = animals.filter(a => a.breed.toLowerCase() === breed.toLowerCase());
    }

    if (status && typeof status === 'string' && status !== 'all') {
      animals = animals.filter(a => a.status === status);
    }

    if (featured !== undefined) {
      animals = animals.filter(a => a.featured === (featured === 'true'));
    }

    if (minPrice) {
      animals = animals.filter(a => a.price >= Number(minPrice));
    }

    if (maxPrice) {
      animals = animals.filter(a => a.price <= Number(maxPrice));
    }

    if (minWeight) {
      animals = animals.filter(a => a.weight >= Number(minWeight));
    }

    if (maxWeight) {
      animals = animals.filter(a => a.weight <= Number(maxWeight));
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      animals = animals.filter(
        a =>
          a.breed.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.color.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      count: animals.length,
      data: animals
    });
  } catch (error: any) {
    console.error('Error fetching animals:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch animals' });
  }
});

// ==================== GET SINGLE ANIMAL BY ID ====================
router.get('/:id', (req: Request, res: Response): void => {
  try {
    const animal = JsonDB.getAnimalById(req.params.id);
    if (!animal) {
      res.status(404).json({ success: false, error: 'Animal not found' });
      return;
    }
    res.json({ success: true, data: animal });
  } catch (error: any) {
    console.error('Error fetching animal:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch animal details' });
  }
});

// ==================== CREATE ANIMAL (Admin only) ====================
router.post('/', authenticateToken, requireAdmin, (req: AuthRequest, res: Response): void => {
  try {
    const { type, breed, gender, weight, color, price, quantity, location, description, images, video, featured, characteristics } = req.body;

    if (!type || !breed || !price) {
      res.status(400).json({ success: false, error: 'Type, breed, and price are required' });
      return;
    }

    const typePrefix = type === 'sheep' ? 'SH' : type === 'goat' ? 'GT' : 'CW';
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newId = `${typePrefix}-${randomNum}`;

    const newAnimal: Animal = {
      id: newId,
      type: type as AnimalType,
      breed: breed.trim(),
      gender: gender || 'Male',
      weight: Number(weight) || 30,
      color: color || 'Natural',
      price: Number(price),
      quantity: quantity !== undefined ? Number(quantity) : 1,
      location: location || 'Aware, Addis Ababa',
      description: description || '',
      status: 'available',
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=1200&q=80'],
      video,
      featured: Boolean(featured),
      characteristics: Array.isArray(characteristics) ? characteristics : [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    const created = JsonDB.createAnimal(newAnimal);

    // 🚀 REALTIME BROADCAST
    realtimeService.broadcast('ANIMAL_CREATED', created);

    res.status(201).json({ success: true, message: 'Animal created successfully', data: created });
  } catch (error: any) {
    console.error('Error creating animal:', error);
    res.status(500).json({ success: false, error: 'Failed to create animal' });
  }
});

// ==================== UPDATE ANIMAL (Admin only) ====================
router.put('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response): void => {
  try {
    const updated = JsonDB.updateAnimal(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Animal not found' });
      return;
    }

    // 🚀 REALTIME BROADCAST
    realtimeService.broadcast('ANIMAL_UPDATED', updated);

    res.json({ success: true, message: 'Animal updated successfully', data: updated });
  } catch (error: any) {
    console.error('Error updating animal:', error);
    res.status(500).json({ success: false, error: 'Failed to update animal' });
  }
});

// ==================== DELETE ANIMAL (Admin only) ====================
router.delete('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response): void => {
  try {
    const animalId = req.params.id;
    const deleted = JsonDB.deleteAnimal(animalId);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Animal not found' });
      return;
    }

    // 🚀 REALTIME BROADCAST
    realtimeService.broadcast('ANIMAL_DELETED', { id: animalId });

    res.json({ success: true, message: 'Animal removed successfully' });
  } catch (error: any) {
    console.error('Error deleting animal:', error);
    res.status(500).json({ success: false, error: 'Failed to delete animal' });
  }
});

export default router;
