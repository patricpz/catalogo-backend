import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { ensureStoreMiddleware } from '../middlewares/ensure-store.middleware.js';
import { uploadSingleImage, validateUploadedImageBuffer } from '../middlewares/upload-image.middleware.js';
import { requireUploadedImage } from '../middlewares/require-uploaded-file.middleware.js';
import { UserController } from '../controllers/user.controller.js';
import { StoreController } from '../controllers/store.controller.js';

const router = Router();
const userController = new UserController();
const storeController = new StoreController();

router.use(authMiddleware);

router.post('/avatar', uploadSingleImage, validateUploadedImageBuffer, requireUploadedImage, userController.uploadAvatar);
router.post(
  '/logo',
  ensureStoreMiddleware,
  uploadSingleImage,
  validateUploadedImageBuffer,
  requireUploadedImage,
  storeController.uploadLogo,
);

export { router as uploadRouter };
