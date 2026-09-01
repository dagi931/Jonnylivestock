import { Router, Response } from 'express';
import { JsonDB } from '../db/jsonDb.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

// ==================== GET ALL NOTIFICATIONS (Admin) ====================
router.get('/', authenticateToken, requireAdmin, (_req: AuthRequest, res: Response): void => {
  try {
    const notifications = JsonDB.getNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;
    res.json({
      success: true,
      unreadCount,
      count: notifications.length,
      data: notifications
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
});

// ==================== MARK NOTIFICATION AS READ ====================
router.put('/:id/read', authenticateToken, requireAdmin, (req: AuthRequest, res: Response): void => {
  try {
    const success = JsonDB.markNotificationRead(req.params.id);
    if (!success) {
      res.status(404).json({ success: false, error: 'Notification not found' });
      return;
    }
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    console.error('Error marking notification read:', error);
    res.status(500).json({ success: false, error: 'Failed to update notification' });
  }
});

// ==================== MARK ALL NOTIFICATIONS AS READ ====================
router.put('/read-all', authenticateToken, requireAdmin, (_req: AuthRequest, res: Response): void => {
  try {
    JsonDB.markAllNotificationsRead();
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ success: false, error: 'Failed to update notifications' });
  }
});

export default router;
