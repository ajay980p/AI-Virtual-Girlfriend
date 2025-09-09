import dotenv from 'dotenv';

dotenv.config();

function parseList(input?: string, fallback: string[] = []) {
    if (!input) return fallback;
    try {
        // Support JSON array or comma-separated list
        if (input.trim().startsWith('[')) return JSON.parse(input);
        return input.split(',').map(s => s.trim()).filter(Boolean);
    } catch {
        return fallback;
    }
}

export const config = {
    host: process.env.BACKEND_HOST || 'localhost',
    port: Number(process.env.BACKEND_PORT || process.env.PORT || 8000),
    debug: String(process.env.DEBUG || 'true').toLowerCase() === 'true',

    authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    authServiceApiUrl: process.env.AUTH_SERVICE_API_URL || 'http://localhost:3001/api',
    jwtSecret: process.env.JWT_SECRET || process.env.AUTH_JWT_SECRET || '',

    pineconeApiKey: process.env.PINECONE_API_KEY || '',
    pineconeIndex: process.env.PINECONE_INDEX || process.env.PINECONE_INDEX_NAME || '',

    openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
    openRouterApiUrl: process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1',

    googleApiKey: process.env.GOOGLE_API_KEY || '',

    // Accept multiple variants: CORS_ORIGIN, CORS_ORIGINS, cors_origin, cors_origins
    corsOrigins: parseList(process.env.CORS_ORIGINS, [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:4500',
    ]),
};

export type AppConfig = typeof config;