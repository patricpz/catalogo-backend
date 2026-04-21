import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { OrderController } from '../controllers/order.controller.js';

const router = Router();
const controller = new OrderController();

router.post('/', authMiddleware, controller.create);
router.get('/', authMiddleware, controller.listByUser);

export { router as orderRouter };
