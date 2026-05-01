import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { UserController } from '../controllers/user.controller.js';

const router = Router();
const controller = new UserController();

router.use(authMiddleware);
router.get('/profile', controller.getProfile);
router.put('/profile', controller.updateProfile);

export { router as userRouter };
