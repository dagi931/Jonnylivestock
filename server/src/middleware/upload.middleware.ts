import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Request, Response, NextFunction } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const prefix = file.fieldname === 'image' ? 'animal' : 'slip';
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WEBP, GIF) and PDF documents are allowed.'));
  }
};

/**
 * 👤 USER UPLOAD LIMIT: 10 MB
 * Generous for high-res smartphone camera receipt screenshots and PDFs,
 * while protecting your VPS storage from disk abuse.
 */
export const uploadUserSlip = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  },
  fileFilter
});

/**
 * 👑 ADMIN UPLOAD LIMIT: 200 MB (Practically Unlimited)
 * Allows administrators to upload ultra high-res 4K livestock photos,
 * promotional banners, and package media without restriction.
 */
export const uploadAdminMedia = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200 MB
  },
  fileFilter
});

// Backward compatibility alias for orders
export const uploadSlip = uploadUserSlip;

/**
 * Multer Error Interceptor Middleware
 * Converts technical multer error codes into polite, human-readable messages.
 */
export const handleUploadError = (err: any, _req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        error: 'The uploaded file exceeds the 10MB size limit. Please upload a standard photo or screenshot.'
      });
      return;
    }
    res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`
    });
    return;
  }
  if (err) {
    res.status(400).json({
      success: false,
      error: err.message || 'Invalid file uploaded.'
    });
    return;
  }
  next();
};
