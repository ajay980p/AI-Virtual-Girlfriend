import express, { Application } from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

import config from './config';
import swaggerSpecs from './config/swagger';
import connectDB from './config/database';
import routes from './routes';
import { generalRateLimit, errorHandler, notFoundHandler } from './middleware';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  private async initializeDatabase(): Promise<void> {
    await connectDB();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'", "'unsafe-inline'"],
        },
      },
    }));

    const allowedOrigins: string[] = config.cors.origin || [];
    const corsOptions: CorsOptions = {
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    };
    this.app.use(cors(corsOptions));

    // Compression middleware
    this.app.use(compression());

    // Request logging
    if (config.app.env === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Cookie parser
    this.app.use(cookieParser(config.cookie.secret));

    // Rate limiting
    this.app.use(generalRateLimit);

    // Trust proxy for rate limiting and security
    this.app.set('trust proxy', 1);

    // Serve static files (uploaded images)
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Auth service is healthy',
        data: {
          environment: config.app.env,
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          version: process.env.npm_package_version || '1.0.0'
        }
      });
    });

    // API routes
    this.app.use('/api', routes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'AI Virtual Girlfriend - Authentication Service',
        data: {
          version: '1.0.0',
          environment: config.app.env,
          documentation: '/api-docs',
          health: '/health'
        }
      });
    });
  }

  private initializeSwagger(): void {
    if (config.api.docsEnabled) {
      // Swagger UI options
      const swaggerOptions = {
        explorer: true,
        customCss: `
          .swagger-ui .topbar { display: none }
          .swagger-ui .info .title { color: #3b82f6 }
        `,
        customSiteTitle: 'AI Virtual Girlfriend - Auth API Documentation',
        customfavIcon: '/favicon.ico',
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
          filter: true,
          showExtensions: true,
          showCommonExtensions: true,
        }
      };

      this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, swaggerOptions));

      // Serve swagger JSON
      this.app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpecs);
      });

      console.log(`📚 Swagger documentation available at http://localhost:${config.app.port}/api-docs`);
    }
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public listen(): void {
    this.app.listen(config.app.port, () => {
      console.log(`🚀 Auth service running on port ${config.app.port}`);
      console.log(`🌍 Environment: ${config.app.env}`);
      console.log(`💾 Database: ${config.database.uri.replace(/\/\/.*@/, '//<credentials>@')}`);

      if (config.api.docsEnabled) {
        console.log(`📚 API Documentation: http://localhost:${config.app.port}/api-docs`);
      }

      console.log(`❤️ Health Check: http://localhost:${config.app.port}/health`);
    });
  }
}

export default App;