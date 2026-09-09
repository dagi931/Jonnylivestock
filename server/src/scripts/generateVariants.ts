import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

async function processAll() {
  if (!fs.existsSync(uploadsDir)) {
    console.log('No uploads directory found at:', uploadsDir);
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  console.log(`Found ${files.length} items in uploads directory.`);

  for (const file of files) {
    if (file.endsWith('-sm.webp') || file.endsWith('-md.webp')) continue;
    if (!file.endsWith('.webp') && !file.endsWith('.jpg') && !file.endsWith('.jpeg') && !file.endsWith('.png')) continue;

    const filePath = path.join(uploadsDir, file);
    const parsed = path.parse(filePath);
    const cleanName = parsed.name.replace(/-sm$/, '').replace(/-md$/, '');

    const smPath = path.join(uploadsDir, `${cleanName}-sm.webp`);
    const mdPath = path.join(uploadsDir, `${cleanName}-md.webp`);
    const fullWebpPath = path.join(uploadsDir, `${cleanName}.webp`);

    try {
      // 1. Generate sm (360px)
      if (!fs.existsSync(smPath)) {
        await sharp(filePath)
          .rotate()
          .resize({ width: 360, height: 360, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 78, effort: 4 })
          .toFile(smPath);
        console.log('Generated sm:', `${cleanName}-sm.webp`);
      }

      // 2. Generate md (640px)
      if (!fs.existsSync(mdPath)) {
        await sharp(filePath)
          .rotate()
          .resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80, effort: 4 })
          .toFile(mdPath);
        console.log('Generated md:', `${cleanName}-md.webp`);
      }

      // 3. Ensure full webp (1200px)
      if (!fs.existsSync(fullWebpPath) || filePath !== fullWebpPath) {
        await sharp(filePath)
          .rotate()
          .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 82, effort: 4 })
          .toFile(fullWebpPath);
        console.log('Generated full webp:', `${cleanName}.webp`);
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }

  console.log('All image variants generated successfully!');
}

processAll();
