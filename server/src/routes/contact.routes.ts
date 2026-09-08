import { Router, Request, Response } from 'express';
import { PostgresDB } from '../db/postgresDb.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.middleware.js';
import { contactLimiter } from '../middleware/rateLimit.middleware.js';
import { sanitizeErrorMessage } from '../utils/errorHandler.js';
import { isValidEthiopianPhone, normalizeEthiopianPhone } from '../utils/phone.js';

const router = Router();

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ==================== PUBLIC: SUBMIT CONTACT US INQUIRY ====================
router.post('/', contactLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, email, animalId, serviceNeeded, message } = req.body;

    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';
    const trimmedEmail = typeof email === 'string' ? email.trim() : '';
    const trimmedMessage = typeof message === 'string' ? message.trim() : '';

    if (!trimmedName) {
      res.status(400).json({ success: false, error: 'Full name is required.' });
      return;
    }
    if (trimmedName.length > 100) {
      res.status(400).json({ success: false, error: 'Name must be 100 characters or fewer.' });
      return;
    }

    if (!trimmedPhone) {
      res.status(400).json({ success: false, error: 'Phone number is required.' });
      return;
    }
    const normalizedPhone = normalizeEthiopianPhone(trimmedPhone);
    if (!isValidEthiopianPhone(normalizedPhone)) {
      res.status(400).json({
        success: false,
        error: 'Please enter a valid Ethiopian phone number (e.g. 0911223344 or 0712345678).'
      });
      return;
    }

    if (!trimmedEmail) {
      res.status(400).json({ success: false, error: 'Email address is required.' });
      return;
    }
    if (trimmedEmail.length > 254) {
      res.status(400).json({ success: false, error: 'Email address must be 254 characters or fewer.' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
      return;
    }

    if (!trimmedMessage) {
      res.status(400).json({ success: false, error: 'Message content is required.' });
      return;
    }
    if (trimmedMessage.length > 5000) {
      res.status(400).json({ success: false, error: 'Message must be 5000 characters or fewer.' });
      return;
    }

    const created = await PostgresDB.createContactMessage({
      name: escapeHtml(trimmedName),
      phone: normalizedPhone,
      email: trimmedEmail.toLowerCase(),
      animalId: animalId ? escapeHtml(String(animalId).trim()) : undefined,
      serviceNeeded: serviceNeeded ? escapeHtml(String(serviceNeeded).trim()) : undefined,
      message: escapeHtml(trimmedMessage)
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
      error: sanitizeErrorMessage(error, 'Failed to deliver message to administration.')
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
      error: sanitizeErrorMessage(error, 'Failed to fetch contact inquiries.')
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
    res.status(500).json({ success: false, error: sanitizeErrorMessage(error, 'Failed to update message') });
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
    res.status(500).json({ success: false, error: sanitizeErrorMessage(error, 'Failed to delete message') });
  }
});

export default router;
