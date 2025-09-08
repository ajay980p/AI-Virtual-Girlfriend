import { Router } from 'express';
import { respondToUser } from '../controllers/chat.controller';

export const router = Router();

router.post('/respond', respondToUser);
