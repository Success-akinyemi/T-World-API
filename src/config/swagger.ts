import swaggerJsdoc from 'swagger-jsdoc';
import { config } from '../config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'T-World Mini API',
      version: '1.0.0',
      description:
        'REST API for the T-World mobile learning platform. Supports user auth, browsing learning items, and saving items to a personal list.',
      contact: {
        name: 'T-World API ',
        email: 'info@tongston.com',
        url: 'https://www.tongston.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api`,
        description: 'Local development server',
      },
      {
        url: 'https://t-world-api.onrender.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token from /auth/login',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Success' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 42 },
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            totalPages: { type: 'integer', example: 5 },
            hasNextPage: { type: 'boolean', example: true },
            hasPrevPage: { type: 'boolean', example: false },
          },
        },
        // Domain models 
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '665b1c2e4d1f2a3b4c5d6e7f' },
            name: { type: 'string', example: 'James Paul' },
            email: { type: 'string', example: 'james@example.com' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Item: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '665b1c2e4d1f2a3b4c5d6e80' },
            title: { type: 'string', example: 'Introduction to Node.js' },
            description: {
              type: 'string',
              example: 'A beginner-friendly course covering Node.js fundamentals.',
            },
            category: {
              type: 'string',
              enum: ['course', 'article', 'video', 'podcast', 'book'],
              example: 'course',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              example: ['node', 'javascript', 'backend'],
            },
            imageUrl: {
              type: 'string',
              example: 'https://example.com/images/nodejs.png',
            },
            author: { type: 'string', example: 'John Smith' },
            duration: { type: 'integer', example: 120, description: 'Duration in minutes' },
            level: {
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced'],
              example: 'beginner',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful' },
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
                user: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
      },
    },
    security: [],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
