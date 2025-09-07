import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import conversationsRouter from './src/routes/conversations.js';

const app = express();

// middleware
app.use(express.json());
app.use(cookieParser());

// mount routes
app.use('/api', conversationsRouter); // 👈 mount under /api

// connect db and start server
mongoose.connect(process.env.MONGO_URI!)
    .then(() => {
        app.listen(process.env.PORT || 6000, () => {
            console.log(`Chat service running on port ${process.env.PORT || 6000}`);
        });
    })
    .catch(err => console.error('DB connection error:', err));