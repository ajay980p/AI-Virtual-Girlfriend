import { Router } from 'express';
import authRoutes from './auth.routes';
import modelRoutes from './model.routes';

const router = Router();

// Mount auth routes
router.use('/auth', authRoutes);

// Mount model routes
router.use('/models', modelRoutes);

export default router;