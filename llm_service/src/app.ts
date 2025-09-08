import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config';
import { attachAuth } from './middleware/auth';
import { router as chatRouter } from './routes/chat.routes';
import { router as memoryRouter } from './routes/memory.routes';
import { healthHandler, rootHandler } from './controllers/system.controller';

const app = express();

// Core middleware
app.use(cors({
    origin: config.corsOrigins,
    credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Attach non-blocking auth context
app.use(attachAuth);

// System routes
app.get('/', rootHandler);
app.get('/health', healthHandler);

// API routes
app.use('/chat', chatRouter);
app.use('/memory', memoryRouter);

export default app;