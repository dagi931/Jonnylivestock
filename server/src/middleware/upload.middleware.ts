import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Request, Response, NextFunction } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');
export const RECEIPTS_DIR = path.resolve(__dirname, '../../receipts');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(RECEIPTS_DIR)) {
  fs.mkdirSync(RECEIPTS_DIR, { recursive: true });
}

export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf'] as const;
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/pjpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf'
] as const;

// Dangerous extensions that must never appear in original filenames (e.g. double extensions)
const DANGEROUS_EXTENSIONS = [
  '.html', '.htm', '.svg', '.php', '.phtml', '.js', '.mjs', '.ts',
  '.exe', '.sh', '.bat', '.cmd', '.vbs', '.ps1', '.py', '.rb',
  '.jar', '.war', '.dll', '.so', '.com', '.scr', '.c', '.cpp'
];

// Dedicated private storage for user payment receipts
const slipStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, RECEIPTS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.includes(ext as any) ? ext : '.jpg';
    cb(null, `slip-${uniqueSuffix}${safeExt}`);
  }
});

// Storage for public catalog media (e.g. animal photos, package promotional images)
const adminStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const prefix = file.fieldname === 'image' ? 'animal' : 'media';
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.includes(ext as any) ? ext : '.jpg';
    cb(null, `${prefix}-${uniqueSuffix}${safeExt}`);
  }
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const originalName = (file.originalname || '').toLowerCase().trim();

  // 1. Reject null bytes and path traversal characters
  if (originalName.includes('\0') || originalName.includes('..') || originalName.includes('/') || originalName.includes('\\')) {
    cb(new Error('Invalid filename. Special characters and path traversal are strictly prohibited.'));
    return;
  }

  // 2. Reject dangerous / executable extensions anywhere in filename (double-extension defense)
  for (const dangerous of DANGEROUS_EXTENSIONS) {
    if (originalName.includes(dangerous)) {
      cb(new Error(`Disallowed file type: "${dangerous}" extensions are forbidden for security.`));
      return;
    }
  }

  // 3. Strict extension check
  const ext = path.extname(originalName);
  if (!ALLOWED_EXTENSIONS.includes(ext as any)) {
    cb(new Error('Only image files (JPEG, PNG, WEBP, GIF) and PDF documents are allowed.'));
    return;
  }

  // 4. Strict client MIME type check
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype as any)) {
    cb(new Error('Only image files (JPEG, PNG, WEBP, GIF) and PDF documents are allowed.'));
    return;
  }

  // 5. Cross-check extension with declared MIME type
  if (ext === '.pdf' && file.mimetype !== 'application/pdf') {
    cb(new Error('File extension does not match the declared MIME type.'));
    return;
  }
  if ((ext === '.jpg' || ext === '.jpeg') && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/pjpeg') {
    cb(new Error('File extension does not match the declared MIME type.'));
    return;
  }
  if (ext === '.png' && file.mimetype !== 'image/png') {
    cb(new Error('File extension does not match the declared MIME type.'));
    return;
  }
  if (ext === '.webp' && file.mimetype !== 'image/webp') {
    cb(new Error('File extension does not match the declared MIME type.'));
    return;
  }
  if (ext === '.gif' && file.mimetype !== 'image/gif') {
    cb(new Error('File extension does not match the declared MIME type.'));
    return;
  }

  cb(null, true);
};

/**
 * Inspects the actual binary magic bytes / file signature on disk.
 * Returns null if valid, or an error message string if invalid.
 */
export const verifyFileSignature = (filePath: string): string | null => {
  try {
    if (!fs.existsSync(filePath)) {
      return 'Uploaded file could not be verified.';
    }

    const stat = fs.statSync(filePath);
    if (stat.size === 0) {
      return 'Uploaded file is empty (0 bytes).';
    }

    // Read the first 16 bytes for magic number identification
    const buffer = Buffer.alloc(16);
    const fd = fs.openSync(filePath, 'r');
    const bytesRead = fs.readSync(fd, buffer, 0, 16, 0);
    fs.closeSync(fd);

    if (bytesRead < 4) {
      return 'File is too small to be a valid image or document.';
    }

    const ext = path.extname(filePath).toLowerCase();

    // JPEG signature: FF D8 FF
    if (ext === '.jpg' || ext === '.jpeg') {
      if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
        return null;
      }
      return 'File content does not match a valid JPEG image.';
    }

    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    if (ext === '.png') {
      if (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4E &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0D &&
        buffer[5] === 0x0A &&
        buffer[6] === 0x1A &&
        buffer[7] === 0x0A
      ) {
        return null;
      }
      return 'File content does not match a valid PNG image.';
    }

    // GIF signature: GIF87a or GIF89a (47 49 46 38)
    if (ext === '.gif') {
      if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
        return null;
      }
      return 'File content does not match a valid GIF image.';
    }

    // WEBP signature: 'RIFF' at 0..3 and 'WEBP' at 8..11
    if (ext === '.webp') {
      const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
      const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
      if (isRiff && isWebp) {
        return null;
      }
      return 'File content does not match a valid WebP image.';
    }

    // PDF signature: %PDF (25 50 44 46)
    if (ext === '.pdf') {
      if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
        return null;
      }
      return 'File content does not match a valid PDF document.';
    }

    return 'Unsupported file format.';
  } catch (err: any) {
    console.error('Error verifying file signature:', err);
    return 'Unable to verify file content authenticity.';
  }
};

/**
 * Multer Error Interceptor Middleware
 * Converts technical multer error codes into polite, human-readable messages.
 */
export const handleUploadError = (err: any, _req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        error: 'The uploaded file exceeds the allowed size limit. Please upload a standard photo or screenshot.'
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

/**
 * Attaches automatic signature verification and 0-byte cleanup to a Multer instance.
 */
function attachSafetyWrapper(uploader: multer.Multer): multer.Multer {
  const originalSingle = uploader.single.bind(uploader);
  uploader.single = (fieldName: string) => {
    const middleware = originalSingle(fieldName);
    return (req: Request, res: Response, next: NextFunction) => {
      middleware(req, res, (err: any) => {
        if (err) {
          return handleUploadError(err, req, res, next);
        }
        if (req.file) {
          const sigError = verifyFileSignature(req.file.path);
          if (sigError) {
            try {
              if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
              }
            } catch {}
            res.status(400).json({
              success: false,
              error: sigError
            });
            return;
          }
        }
        next();
      });
    };
  };
  return uploader;
}

/**
 * 👤 USER UPLOAD LIMIT: 10 MB (Private payment slips)
 */
const rawUserSlip = multer({
  storage: slipStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  },
  fileFilter
});

/**
 * 👑 ADMIN UPLOAD LIMIT: 200 MB (Catalog animal & package media)
 */
const rawAdminMedia = multer({
  storage: adminStorage,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200 MB
  },
  fileFilter
});

export const uploadUserSlip = attachSafetyWrapper(rawUserSlip);
export const uploadAdminMedia = attachSafetyWrapper(rawAdminMedia);
export const uploadSlip = uploadUserSlip;

