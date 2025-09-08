import swaggerUi from 'swagger-ui-express';
import { Express, Request, Response } from 'express';

const openapiSpec = {
    openapi: '3.0.0',
    info: {
        title: 'Project Aria – AI Virtual Girlfriend (LLM Service)',
        version: '0.1.0',
        description: 'LLM service API for chat responses and memory operations',
    },
    servers: [{ url: '/' }],
    tags: [
        { name: 'System', description: 'System endpoints' },
        { name: 'Chat', description: 'Chat endpoints' },
        { name: 'Memory', description: 'Memory endpoints' },
    ],
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
        schemas: {
            ChatRequest: {
                type: 'object',
                required: ['user_id', 'message'],
                properties: {
                    user_id: { type: 'string', example: 'user_123' },
                    message: { type: 'string', example: 'Hi Aria!' },
                    conversation_id: { type: 'string', nullable: true },
                    auth_token: { type: 'string', nullable: true },
                },
            },
            ChatResponse: {
                type: 'object',
                properties: {
                    response: { type: 'string' },
                    conversation_id: { type: 'string', nullable: true },
                },
            },
            MemoryRequest: {
                type: 'object',
                required: ['user_id', 'text'],
                properties: {
                    user_id: { type: 'string' },
                    text: { type: 'string' },
                    memory_type: { type: 'string', example: 'conversation' },
                },
            },
        },
    },
    paths: {
        '/': {
            get: {
                tags: ['System'],
                summary: 'Root endpoint test',
                responses: { '200': { description: 'OK' } },
            },
        },
        '/health': {
            get: {
                tags: ['System'],
                summary: 'Health check',
                responses: { '200': { description: 'OK' } },
            },
        },
        '/chat/respond': {
            post: {
                tags: ['Chat'],
                summary: 'Generate chat response',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ChatRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'AI response',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/ChatResponse' } } },
                    },
                    '400': { description: 'Bad request' },
                    '500': { description: 'Server error' },
                },
            },
        },
        '/memory/ping': {
            get: {
                tags: ['Memory'],
                summary: 'Memory ping',
                responses: { '200': { description: 'OK' } },
            },
        },
        '/memory': {
            post: {
                tags: ['Memory'],
                summary: 'Store memory',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { $ref: '#/components/schemas/MemoryRequest' } },
                    },
                },
                responses: {
                    '200': { description: 'Stored' },
                    '400': { description: 'Bad request' },
                    '500': { description: 'Server error' },
                },
            },
        },
    },
};

export function setupSwagger(app: Express) {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
    app.get('/docs.json', (_req: Request, res: Response) => res.json(openapiSpec));
}
