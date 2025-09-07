import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Chat Service API',
            version: '1.0.0',
            description: 'API documentation for the AI Virtual Girlfriend Chat Service',
            contact: {
                name: 'API Support',
                email: 'support@example.com',
            },
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:3001',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'token',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Error message',
                        },
                        message: {
                            type: 'string',
                            description: 'Detailed error description',
                        },
                        statusCode: {
                            type: 'number',
                            description: 'HTTP status code',
                        },
                    },
                },
                Message: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Message ID',
                        },
                        conversationId: {
                            type: 'string',
                            description: 'Conversation ID',
                        },
                        content: {
                            type: 'string',
                            description: 'Message content',
                        },
                        sender: {
                            type: 'string',
                            enum: ['user', 'ai'],
                            description: 'Message sender',
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Message timestamp',
                        },
                        metadata: {
                            type: 'object',
                            description: 'Additional message metadata',
                        },
                    },
                    required: ['id', 'conversationId', 'content', 'sender', 'timestamp'],
                },
                Conversation: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Conversation ID',
                        },
                        userId: {
                            type: 'string',
                            description: 'User ID',
                        },
                        title: {
                            type: 'string',
                            description: 'Conversation title',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation timestamp',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp',
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'Whether conversation is active',
                        },
                        metadata: {
                            type: 'object',
                            description: 'Additional conversation metadata',
                        },
                    },
                    required: ['id', 'userId', 'title', 'createdAt', 'updatedAt'],
                },
                CreateMessageRequest: {
                    type: 'object',
                    properties: {
                        content: {
                            type: 'string',
                            description: 'Message content',
                            minLength: 1,
                            maxLength: 2000,
                        },
                        metadata: {
                            type: 'object',
                            description: 'Optional message metadata',
                        },
                    },
                    required: ['content'],
                },
                CreateConversationRequest: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            description: 'Conversation title',
                            minLength: 1,
                            maxLength: 100,
                        },
                        metadata: {
                            type: 'object',
                            description: 'Optional conversation metadata',
                        },
                    },
                    required: ['title'],
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
            {
                cookieAuth: [],
            },
        ],
    },
    apis: [
        './src/routes/*.ts', // Path to the API files
        './src/controllers/*.ts', // Path to controller files
    ],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
    // Swagger UI setup
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Chat Service API Documentation',
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            docExpansion: 'none',
            filter: true,
            showExtensions: true,
            showCommonExtensions: true,
        },
    }));

    // API documentation in JSON format
    app.get('/api-docs.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    });
};

export default specs;
