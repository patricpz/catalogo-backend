import type { RequestHandler } from 'express';
import multer from 'multer';
import { AppError } from '../utils/app-error.js';
import { detectImageMimeFromBuffer } from '../utils/image-file.js';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MiB

/** MIME declarado no multipart; a validação real é por assinatura em `validateUploadedImageBuffer`. */
const ALLOWED_DECLARED_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/octet-stream',
]);

const storage = multer.memoryStorage();

export const uploadSingleImage = multer({
  storage,
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter(_req, file, cb) {
    const declared = (file.mimetype || '').trim().toLowerCase() || 'application/octet-stream';
    if (!ALLOWED_DECLARED_MIMES.has(declared)) {
      cb(
        new AppError(
          400,
          'Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF (multipart, campo "image").',
          'INVALID_FILE_TYPE',
        ),
      );
      return;
    }
    cb(null, true);
  },
}).single('image');

/** Corrige `req.file.mimetype` e rejeita arquivos que não são imagem suportada. */
export const validateUploadedImageBuffer: RequestHandler = (req, _res, next) => {
  const file = req.file;
  if (!file) {
    next();
    return;
  }
  if (!file.buffer?.length) {
    next(new AppError(400, 'Arquivo vazio.', 'FILE_EMPTY'));
    return;
  }
  const detected = detectImageMimeFromBuffer(file.buffer);
  if (!detected) {
    next(new AppError(400, 'Arquivo não é uma imagem válida (JPEG, PNG, WebP ou GIF).', 'INVALID_IMAGE_PAYLOAD'));
    return;
  }
  file.mimetype = detected;
  next();
};
