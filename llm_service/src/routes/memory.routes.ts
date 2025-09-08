import { Router } from 'express';
import { ping, storeMemoryHandler } from '../controllers/memory.controller';

export const router = Router();

router.get('/ping', ping);
router.post('/', storeMemoryHandler);
