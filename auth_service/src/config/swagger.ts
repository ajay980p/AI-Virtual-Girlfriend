import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';
import config from './index';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'AI Virtual Girlfriend - Authentication Service API',
    version: '1.0.0',
    description: `
      Authentication service for AI Virtual Girlfriend application built with Express.js and TypeScript.
      
      This service provides comprehensive user authentication and management features including:
      - User registration and login
      - JWT-based authentication with refresh tokens
      - Password management (change, reset)
      - Email verification
      - User profile management
      - Account security features (rate limiting, account locking)
      
      ## Authentication
      
      Most endpoints require authentication using JWT Bearer tokens. Include the token in the Authorization header:
      \`Authorization: Bearer <your-access-token>\`
      
      ## Rate Limiting
      
      This API implements rate limiting to prevent abuse:
      - General requests: 1000 requests per 15 minutes
      - Authentication endpoints: 5 requests per 15 minutes
      - Password reset: 3 requests per hour
      - Email verification: 5 requests per hour
      
      ## Error Responses
      
      All endpoints return consistent error responses with the following structure:
      \`\`\`json
      {
        "success": false,
        "message": "Error description",
        "errors": {
          "field": "Specific field error message"
        }
      }
      \`\`\`
    `,
    contact: {
      name: 'AI Virtual Girlfriend Team',
      url: 'https://github.com/ai-virtual-girlfriend',
      email: 'support@aivirtualgirlfriend.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: `http://localhost:${config.app.port}/api`,
      description: 'Development server'
    },
    {
      url: 'https://api.aivirtualgirlfriend.com/auth',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT Bearer token'
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication endpoints (register, login, logout, etc.)'
    },
    {
      name: 'Profile',
      description: 'User profile management endpoints'
    },
    {
      name: 'Security',
      description: 'Password and security management endpoints'
    },
    {
      name: 'Verification',
      description: 'Email verification endpoints'
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts'
  ],
};

const specs = swaggerJsdoc(options);

export default specs;