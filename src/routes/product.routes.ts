import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { ensureStoreMiddleware } from '../middlewares/ensure-store.middleware.js';
import { ProductController } from '../controllers/product.controller.js';
import { uploadSingleImage, validateUploadedImageBuffer } from '../middlewares/upload-image.middleware.js';
import { requireUploadedImage } from '../middlewares/require-uploaded-file.middleware.js';

const router = Router();
const controller = new ProductController();

router.use(authMiddleware);
router.use(ensureStoreMiddleware);

router.post('/', controller.create);
router.get('/', controller.list);
router.post(
  '/:productId/image',
  uploadSingleImage,
  validateUploadedImageBuffer,
  requireUploadedImage,
  controller.uploadImage,
);
router.get('/:productId', controller.getOne);
router.put('/:productId', controller.update);
router.delete('/:productId', controller.delete);

export { router as productRouter };
