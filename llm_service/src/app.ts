import express from 'express';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config';
import { router as chatRouter } from './routes/chat.routes';
import { router as memoryRouter } from './routes/memory.routes';
import { healthHandler, rootHandler } from './controllers/system.controller';
import { setupSwagger } from './config/swagger';

const app = express();

// Core middleware
const allowedOrigins: string[] = config.corsOrigins || [];
const corsOptions: CorsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// System routes
app.get('/', rootHandler);
app.get('/health', healthHandler);

// API routes
app.use('/chat', chatRouter);
app.use('/memory', memoryRouter);

// Swagger docs
setupSwagger(app);

export default app;