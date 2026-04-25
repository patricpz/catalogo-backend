import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { ensureStoreMiddleware } from '../middlewares/ensure-store.middleware.js';
import { StoreController } from '../controllers/store.controller.js';
import { uploadSingleImage, validateUploadedImageBuffer } from '../middlewares/upload-image.middleware.js';
import { requireUploadedImage } from '../middlewares/require-uploaded-file.middleware.js';

const router = Router();
const controller = new StoreController();

router.post('/', authMiddleware, controller.create);
router.get('/me', authMiddleware, ensureStoreMiddleware, controller.getMe);
router.post(
  '/image',
  authMiddleware,
  ensureStoreMiddleware,
  uploadSingleImage,
  validateUploadedImageBuffer,
  requireUploadedImage,
  controller.uploadImage,
);
router.put('/', authMiddleware, ensureStoreMiddleware, controller.update);
router.delete('/', authMiddleware, ensureStoreMiddleware, controller.delete);

export { router as storeRouter };
