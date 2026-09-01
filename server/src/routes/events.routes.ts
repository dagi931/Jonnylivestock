import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { realtimeService } from '../services/realtime.service.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jonny_livestock_jwt_secret_key_2026';

router.get('/', (req: Request, res: Response): void => {
  // Set headers for Server-Sent Events (SSE)
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*'
  });

  // Flush headers
  if (typeof (res as any).flush === 'function') {
    (res as any).flush();
  }

  // Extract optional auth token from query parameter or header
  let clientInfo: { userId?: string; role?: 'customer' | 'admin' } = {};
  const token = (req.query.token as string) || (req.headers['authorization']?.startsWith('Bearer ') ? req.headers['authorization'].split(' ')[1] : null);

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      clientInfo = {
        userId: decoded.id,
        role: decoded.role
      };
    } catch {
      // Ignore token decoding error, connect as guest/customer
    }
  }

  const clientId = realtimeService.addClient(res, clientInfo);

  // Clean up when client disconnects
  req.on('close', () => {
    realtimeService.removeClient(clientId);
  });
});

export default router;
