import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { ensureStoreMiddleware } from '../middlewares/ensure-store.middleware.js';
import { OrderController } from '../controllers/order.controller.js';

const router = Router();
const controller = new OrderController();

router.use(authMiddleware);
router.use(ensureStoreMiddleware);

router.post('/', controller.create);
router.get('/', controller.listByUser);

export { router as orderRouter };
