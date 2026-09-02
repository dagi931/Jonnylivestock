import { Router, Response } from 'express';
import { PostgresDB } from '../db/postgresDb.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.middleware.js';
import { realtimeService } from '../services/realtime.service.js';

const router = Router();

// ==================== GET ALL NOTIFICATIONS (Admin) ====================
router.get('/', authenticateToken, requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await PostgresDB.getNotifications();
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
router.put('/:id/read', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const success = await PostgresDB.markNotificationRead(req.params.id);
    if (!success) {
      res.status(404).json({ success: false, error: 'Notification not found' });
      return;
    }

    // 🚀 REALTIME BROADCAST
    realtimeService.broadcast('NOTIFICATIONS_READ', { id: req.params.id });

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    console.error('Error marking notification read:', error);
    res.status(500).json({ success: false, error: 'Failed to update notification' });
  }
});

// ==================== MARK ALL NOTIFICATIONS AS READ ====================
router.put('/read-all', authenticateToken, requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    await PostgresDB.markAllNotificationsRead();

    // 🚀 REALTIME BROADCAST
    realtimeService.broadcast('NOTIFICATIONS_READ', { all: true });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ success: false, error: 'Failed to update notifications' });
  }
});

export default router;
