import { Request } from 'express';
import { IUser } from '../db/models/User';

// Extend Express Request to carry authenticated user
export interface AuthRequest extends Request {
  user?: IUser;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface ItemsQuery extends PaginationQuery {
  category?: string;
  level?: string;
  search?: string;
}

export interface PaginationMeta extends Record<string, unknown> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
