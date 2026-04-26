import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { config } from './config';
import { swaggerSpec } from './config/swagger';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import itemsRoutes from './routes/items.routes';
import meRoutes from './routes/me.routes';

const app: Application = express();

// Security headers 
app.use(helmet());

//CORS
app.use(
  cors({
    origin: config.env === 'production' ? config.clientUrl : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// ── Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api', limiter);

// ── Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 min
  max: 20,
  message: {
    success: false,
    message: 'Too many auth attempts, please try again in 5 minutes.',
  },
});
app.use('/api/auth', authLimiter);

// ── Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── HTTP request logging 
if (config.env !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.http(msg.trim()) },
    }),
  );
}

// ── Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'T-World API is running', env: config.env });
});

// Swagger UI
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'T-World API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
    },
  }),
);

// raw OpenAPI JSON
app.get('/api/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/me', meRoutes);

// ── 404 & Global error handler
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
