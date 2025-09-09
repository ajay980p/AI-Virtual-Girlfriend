import express from 'express';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config';
import { setupSwagger } from './config/swagger';
import { router } from "./routes/index"

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

// API routes
app.use("/api", router);

// Swagger docs
setupSwagger(app);

export default app;