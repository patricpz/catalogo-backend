import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { storeRouter } from './store.routes.js';
import { productRouter } from './product.routes.js';
import { orderRouter } from './order.routes.js';
import { supabaseDemoRouter } from './supabase-demo.routes.js';
import { StoreController } from '../controllers/store.controller.js';

const router = Router();

const storeController = new StoreController();

router.use('/auth', authRouter);
router.use('/stores', storeRouter);
router.use('/products', productRouter);
router.use('/orders', orderRouter);
router.use('/supabase', supabaseDemoRouter);

// Public catalog by store slug (no auth)
router.get('/catalog/:slug', storeController.getBySlug);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export { router as apiRouter };
