import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { ensureStoreMiddleware } from '../middlewares/ensure-store.middleware.js';
import { StoreController } from '../controllers/store.controller.js';

const router = Router();
const controller = new StoreController();

router.get('/:id', authMiddleware, controller.getById);
router.put('/:id', authMiddleware, ensureStoreMiddleware, controller.update);
router.put('/:id/hours', authMiddleware, ensureStoreMiddleware, controller.updateHours);
router.put('/:id/color', authMiddleware, ensureStoreMiddleware, controller.updateColor);
router.get('/:id/alerts', authMiddleware, controller.getAlerts);
router.get('/:id/plan', authMiddleware, controller.getPlan);

export { router as storeProfileRouter };
