/**
 * Environment configuration loader
 * This ensures environment variables are properly loaded at runtime
 */

// Load environment variables from .env files
const loadEnvConfig = () => {
    // For server-side, try to load from process.env
    if (typeof window === 'undefined') {
        try {
            // Try to read .env file directly if available
            const fs = require('fs');
            const path = require('path');

            const envPath = path.join(process.cwd(), '.env');
            const envLocalPath = path.join(process.cwd(), '.env.local');

            // Read .env file
            if (fs.existsSync(envPath)) {
                const envFile = fs.readFileSync(envPath, 'utf8');
                envFile.split('\n').forEach((line: string) => {
                    const [key, value] = line.split('=');
                    if (key && value && !process.env[key.trim()]) {
                        process.env[key.trim()] = value.trim();
                    }
                });
            }

            // Read .env.local file (overrides .env)
            if (fs.existsSync(envLocalPath)) {
                const envLocalFile = fs.readFileSync(envLocalPath, 'utf8');
                envLocalFile.split('\n').forEach((line: string) => {
                    const [key, value] = line.split('=');
                    if (key && value) {
                        process.env[key.trim()] = value.trim();
                    }
                });
            }
        } catch (error) {
            console.warn('Could not load .env files:', error);
        }
    }
};

// Load config on import
loadEnvConfig();

export const getConfig = () => {
    return {
        NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
        NEXT_PUBLIC_AUTH_SERVICE_URL: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001/api',
    };
};

export default getConfig;
