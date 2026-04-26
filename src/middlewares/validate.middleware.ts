import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError';

/**
 * Runs after express-validator chains.
 * If there are errors, format them and pass to error handler.
 */
export const validate = (req: Request, _res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const formatted = errors
    .array()
    .map((e) => e.msg)
    .join('. ');

  next(new AppError(formatted, 422));
};
