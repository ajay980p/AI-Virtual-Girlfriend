import { Router } from 'express';
import { router as chatRouter } from './chat.routes';
import { router as memoryRouter } from './memory.routes';
import conversationRouter from './conversation.routes';
import { healthHandler, rootHandler } from '../controllers/system.controller';

export const router = Router();

// Mount feature routers
router.get("/", rootHandler);
router.get('/health', healthHandler);

router.use('/chat', chatRouter);
router.use('/memory', memoryRouter);
router.use('/conversations', conversationRouter);