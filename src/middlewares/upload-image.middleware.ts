import multer from 'multer';
import { AppError } from '../utils/app-error.js';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MiB

const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const storage = multer.memoryStorage();

export const uploadSingleImage = multer({
  storage,
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter(_req, file, cb) {
    if (!ALLOWED_MIMES.has(file.mimetype)) {
      cb(new AppError(400, 'Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.', 'INVALID_FILE_TYPE'));
      return;
    }
    cb(null, true);
  },
}).single('image');
