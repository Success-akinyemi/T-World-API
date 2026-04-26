import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { config } from '../config';

// ── Normalise specific Mongoose/JWT errors into AppError ─────────────────────

const handleCastError = (err: mongoose.Error.CastError): AppError =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleValidationError = (err: mongoose.Error.ValidationError): AppError => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation failed: ${messages.join('. ')}`, 422);
};

const handleDuplicateKeyError = (err: { keyValue: Record<string, unknown> }): AppError => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field} already exists. Please use a different value.`, 409);
};

// ── Main error handler ────────────────────────────────────────────────────────

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let error = err instanceof AppError ? err : new AppError(err.message, 500, false);

  // Mongoose cast error (bad ObjectId)
  if (err instanceof mongoose.Error.CastError) error = handleCastError(err);

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) error = handleValidationError(err);

  // MongoDB duplicate key
  if ((err as { code?: number }).code === 11000)
    error = handleDuplicateKeyError(err as unknown as { keyValue: Record<string, unknown> });

  // Log unexpected errors
  if (!error.isOperational) {
    logger.error('Unexpected error:', err);
  }

  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  });
};

// ── 404 handler ───────────────────────────────────────────────────────────────
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
};
