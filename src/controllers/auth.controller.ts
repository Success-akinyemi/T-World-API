import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';

export const AuthController = {
  /**
   * @route  POST /api/auth/register
   * @access Public
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = req.body;
      const result = await AuthService.register({ name, email, password });
      sendSuccess(res, result, 'Account created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * @route  POST /api/auth/login
   * @access Public
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  },
};
