import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { setupSwagger } from './config/swagger';
import routes from './routes';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Logging middleware
app.use(morgan('combined'));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Setup Swagger documentation
setupSwagger(app);

// API routes
app.use(routes);

// Health check endpoint
app.get('/', (_req, res) => {
    res.json({
        message: 'Chat Service API is running!',
        version: '1.0.0',
        documentation: '/api-docs',
        timestamp: new Date().toISOString(),
    });
});

// API health endpoint
app.get('/health', (_req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
    });
});

export default app;