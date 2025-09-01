import { Router } from 'express';
import authRoutes from './auth.routes';
import modelRoutes from './model.routes';
import conversationRoutes from './conversation.routes';

const router = Router();

// Mount auth routes
router.use('/auth', authRoutes);

// Mount model routes
router.use('/models', modelRoutes);

// Mount conversation routes
router.use('/conversations', conversationRoutes);

export default router;