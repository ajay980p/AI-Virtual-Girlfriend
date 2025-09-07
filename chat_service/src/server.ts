import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import app from './app';

// Additional middleware for server
app.use(cookieParser());

const PORT = process.env.PORT || 6000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chat_service';

// Connect to MongoDB and start server
const startServer = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const server = app.listen(PORT, () => {
            console.log(`🚀 Chat service running on port ${PORT}`);
            console.log(`📚 API Documentation available at: http://localhost:${PORT}/api-docs`);
            console.log(`🔍 Health check available at: http://localhost:${PORT}/health`);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                mongoose.connection.close();
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('SIGINT received. Shutting down gracefully...');
            server.close(() => {
                mongoose.connection.close();
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('❌ DB connection error:', error);
        process.exit(1);
    }
};

startServer();
