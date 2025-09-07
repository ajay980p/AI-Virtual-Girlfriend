import { Router } from 'express';
import conversationRoutes from './conversations';

const router = Router();

// Mount route modules
router.use('/api', conversationRoutes);

export default router;
