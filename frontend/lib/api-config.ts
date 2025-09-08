/**
 * API Configuration - Direct configuration for server deployment
 * Modify these values directly for your server environment
 */

export const API_CONFIG = {
  // Backend API URL (Python RAG service)
  BACKEND_URL: process.env.NEXT_PUBLIC_LLM_SERVICE_URL || 'http://localhost:8000',

  // Auth Service URL (Express.js TypeScript service)  
  AUTH_SERVICE_URL: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001/api',
};

export default API_CONFIG;
