import express from 'express';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config';
import { setupSwagger } from './config/swagger';
import { router } from "./routes/index"
import dotenv from 'dotenv';
import { authMiddleware } from './middleware/auth.middleware';
dotenv.config(); // MUST come before importing config

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

app.use(authMiddleware);


// API routes
app.use("/api", router);

// Swagger docs
setupSwagger(app);

export default app;