import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireAdminMiddleware } from '../middlewares/require-admin.middleware.js';

const router = Router();
const controller = new AdminController();

router.use(authMiddleware);
router.use(requireAdminMiddleware);

router.get('/dashboard', controller.dashboard);

router.get('/lojas', controller.listStores);
router.get('/lojas/:id', controller.getStoreById);
router.patch('/lojas/:id/status', controller.updateStoreStatus);

router.get('/usuarios', controller.listUsers);
router.patch('/usuarios/:id/status', controller.updateUserStatus);

router.get('/pedidos', controller.listOrders);
router.get('/pedidos/:id', controller.getOrderById);

router.get('/catalogos', controller.listCatalogs);
router.patch('/catalogos/:id/status', controller.updateCatalogStatus);

router.get('/produtos', controller.listProducts);
router.patch('/produtos/:id/status', controller.updateProductStatus);
router.delete('/produtos/:id', controller.deleteProduct);

export { router as adminRouter };
