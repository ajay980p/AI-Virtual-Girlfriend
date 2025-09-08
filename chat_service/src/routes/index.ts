import { Router } from 'express';
import conversationRoutes from './conversations.routes';
import agentRoutes from './agents.routes';
import messageRoutes from './messages.routes';

const router = Router();

// Mount route modules
router.use('/conversations', conversationRoutes);
router.use('/agents', agentRoutes);
router.use('/messages', messageRoutes);

export default router;