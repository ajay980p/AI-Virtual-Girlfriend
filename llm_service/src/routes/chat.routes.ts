import { Router } from 'express';
import { respondToUser } from '../controllers/chat.controller';

export const router = Router();

// Apply auth middleware to all chat routes

router.post('/respond', respondToUser);
