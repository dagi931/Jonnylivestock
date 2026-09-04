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
import { globalLimiter } from './middleware/rateLimit.middleware.js';

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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploaded files (payment slips, animal photos)
app.use('/uploads', express.static(UPLOADS_DIR));

// Healthcheck
app.get('/api/health', async (_req, res) => {
  try {
    const animalCount = await prisma.animal.count();
    res.json({
      status: 'ok',
      database: 'PostgreSQL (Supabase) via Prisma',
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
app.use('/api/contact', contactRoutes);
app.use('/api/admin/notifications', notificationsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/events', eventsRoutes);

// Error Handling Middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, async () => {
  console.log(`=========================================`);
  console.log(` 🚀 Jonny Livestock API Server Running `);
  console.log(` 🌐 Port: http://localhost:${PORT}`);
  console.log(` 🐘 Database: Supabase PostgreSQL`);
  console.log(` 📁 Uploads: ${UPLOADS_DIR}`);
  console.log(`=========================================`);

  try {
    await prisma.$connect();
    console.log(`✅ Connected to Supabase PostgreSQL successfully!`);
  } catch (err) {
    console.error(`❌ Failed to connect to PostgreSQL:`, err);
  }
});

export default app;
