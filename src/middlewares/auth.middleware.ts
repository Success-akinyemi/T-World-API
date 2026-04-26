import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../db/models/User';
import { config } from '../config';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../types';

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

export const protect = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next(new AppError('Authentication required. Please log in.', 401));
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch {
      return next(new AppError('Invalid or expired token. Please log in again.', 401));
    }

    // 3. Check user still exists
    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return next(new AppError('Invalid User.', 401));
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
