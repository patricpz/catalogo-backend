import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { storeRouter } from './store.routes.js';
import { productRouter } from './product.routes.js';
import { orderRouter } from './order.routes.js';
import { supabaseDemoRouter } from './supabase-demo.routes.js';
import { StoreController } from '../controllers/store.controller.js';
import { adminRouter } from './admin.routes.js';
import { userRouter } from './user.routes.js';
import { storeProfileRouter } from './store-profile.routes.js';
import { uploadRouter } from './upload.routes.js';

const router = Router();

const storeController = new StoreController();

router.use('/auth', authRouter);
router.use('/stores', storeRouter);
router.use('/store', storeProfileRouter);
router.use('/products', productRouter);
router.use('/orders', orderRouter);
router.use('/user', userRouter);
router.use('/upload', uploadRouter);
router.use('/supabase', supabaseDemoRouter);
router.use('/admin', adminRouter);

// Public catalog by store slug (no auth)
router.get('/catalog/:slug', storeController.getBySlug);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export { router as apiRouter };
