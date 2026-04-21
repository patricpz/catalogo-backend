import type { RequestHandler } from 'express';
import { AppError } from '../utils/app-error.js';

/** Deve ser usado após multer.single('image'). */
export const requireUploadedImage: RequestHandler = (req, _res, next) => {
  if (!req.file) {
    next(new AppError(400, 'Envie um arquivo no campo "image" (multipart/form-data).', 'FILE_REQUIRED'));
    return;
  }
  next();
};
