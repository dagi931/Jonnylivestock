import { Router, Request, Response } from 'express';
import { PostgresDB } from '../db/postgresDb.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

// ==================== PUBLIC: SUBMIT CONTACT US INQUIRY ====================
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, email, animalId, serviceNeeded, message } = req.body;

    if (!name || !phone || !message) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: name, phone, and message are required.'
      });
      return;
    }

    const created = await PostgresDB.createContactMessage({
      name,
      phone,
      email,
      animalId,
      serviceNeeded,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Your message has reached Jonny Livestock administration. We will get in touch shortly.',
      data: created
    });
  } catch (error: any) {
    console.error('Error saving contact message:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to deliver message to administration.'
    });
  }
});

// ==================== ADMIN: GET ALL CONTACT INQUIRIES ====================
router.get('/', authenticateToken, requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const messages = await PostgresDB.getContactMessages();
    res.json({
      success: true,
      data: messages
    });
  } catch (error: any) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch contact inquiries.'
    });
  }
});

// ==================== ADMIN: MARK INQUIRY AS READ ====================
router.put('/:id/read', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const success = await PostgresDB.markContactMessageRead(req.params.id);
    if (!success) {
      res.status(404).json({ success: false, error: 'Message not found' });
      return;
    }
    res.json({ success: true, message: 'Message marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update message' });
  }
});

// ==================== ADMIN: DELETE INQUIRY ====================
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const success = await PostgresDB.deleteContactMessage(req.params.id);
    if (!success) {
      res.status(404).json({ success: false, error: 'Message not found' });
      return;
    }
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to delete message' });
  }
});

export default router;
