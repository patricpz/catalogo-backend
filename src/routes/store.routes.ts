import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { StoreController } from '../controllers/store.controller.js';
import { uploadSingleImage } from '../middlewares/upload-image.middleware.js';
import { requireUploadedImage } from '../middlewares/require-uploaded-file.middleware.js';

const router = Router();
const controller = new StoreController();

router.post('/', authMiddleware, controller.create);
router.get('/me', authMiddleware, controller.getMe);
router.post('/image', authMiddleware, uploadSingleImage, requireUploadedImage, controller.uploadImage);
router.put('/', authMiddleware, controller.update);
router.delete('/', authMiddleware, controller.delete);

export { router as storeRouter };
