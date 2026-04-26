import app from './app';
import { connectDB } from './db/connection';
import { config } from './config';
import { logger } from './utils/logger';

// Handle uncaught exceptions synchronously – must be registered early
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

const start = async (): Promise<void> => {
  await connectDB();

  const server = app.listen(config.port, () => {
    logger.info(`T-World API running on port ${config.port} [${config.env}]`);
    logger.info(`Swagger docs → http://localhost:${config.port}/api/docs`);
  });

  // Handle unhandled promise rejections gracefully
  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('UNHANDLED REJECTION! Shutting down...', reason);
    server.close(() => process.exit(1));
  });

  // Graceful shutdown on SIGTERM (e.g. Docker / Kubernetes)
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Closing HTTP server...');
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  });
};

start();
