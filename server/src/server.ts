import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import prisma from './db/prisma.js';

import authRoutes from './routes/auth.routes.js';
import animalsRoutes from './routes/animals.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import eventsRoutes from './routes/events.routes.js';
import packagesRoutes from './routes/packages.routes.js';
import contactRoutes from './routes/contact.routes.js';
import deliveryRoutes from './routes/delivery.routes.js';
import { globalLimiter } from './middleware/rateLimit.middleware.js';
import { handleUploadError } from './middleware/upload.middleware.js';
import { sanitizeErrorMessage } from './utils/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Serve static uploaded files (payment slips, animal photos)
app.use('/uploads', express.static(UPLOADS_DIR));

// Root route
app.get('/', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Jonny Livestock Backend API</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #1a120b; color: #f4e8d0; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
          .card { background: #24170d; border: 1px solid #4a2c16; padding: 32px; border-radius: 16px; max-width: 480px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          h1 { color: #d97706; margin-top: 0; font-size: 24px; }
          p { color: #d4b896; font-size: 14px; line-height: 1.6; }
          .btn { display: inline-block; background: #d97706; color: #000; padding: 12px 24px; font-weight: bold; border-radius: 10px; text-decoration: none; margin-top: 16px; transition: transform 0.2s; }
          .btn:hover { transform: scale(1.03); }
          .badge { display: inline-block; background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; margin-bottom: 12px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">● Backend API Server Online</div>
          <h1>Jonny Livestock API</h1>
          <p>The backend server is running smoothly on port 5000 and connected to Local PostgreSQL.</p>
          <p>To view and use the website interface, open the <strong>Frontend Application</strong>:</p>
          <a href="http://localhost:5173" class="btn">Go to Frontend Website (Port 5173) →</a>
        </div>
      </body>
    </html>
  `);
});

// Healthcheck
app.get('/api/health', async (_req, res) => {
  try {
    const animalCount = await prisma.animal.count();
    res.json({
      status: 'ok',
      database: 'Local PostgreSQL via Prisma',
      animalCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'database_error',
      error: error.message
    });
  }
});

// Apply global rate limiter across all /api routes
app.use('/api', globalLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/animals', animalsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/packages', packagesRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin/notifications', notificationsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/events', eventsRoutes);

// Multer Upload Error Interceptor (gives friendly error when exceeding limits)
app.use(handleUploadError);

// General Error Handling Middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: sanitizeErrorMessage(err, 'Internal Server Error')
  });
});

app.listen(PORT, async () => {
  console.log(`=========================================`);
  console.log(` 🚀 Jonny Livestock API Server Running `);
  console.log(` 🌐 Port: http://localhost:${PORT}`);
  console.log(` 🐘 Database: Local PostgreSQL (jonny_livestock)`);
  console.log(` 📁 Uploads: ${UPLOADS_DIR}`);
  console.log(`=========================================`);

  try {
    await prisma.$connect();
    console.log(`✅ Connected to Local PostgreSQL successfully!`);
  } catch (err) {
    console.error(`❌ Failed to connect to PostgreSQL:`, err);
  }
});

export default app;
