import { Response, NextFunction } from 'express';
import { ItemsService } from '../services/items.service';
import { AuthRequest, ItemsQuery } from '../types';
import { sendSuccess } from '../utils/response';

export const ItemsController = {
  /**
   * @route  GET /api/items
   * @access Public
   */
  async listItems(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as ItemsQuery;
      const result = await ItemsService.listItems(query);
      sendSuccess(res, result.items, 'Items retrieved', 200, result.meta);
    } catch (error) {
      next(error);
    }
  },

  /**
   * @route  GET /api/items/:id
   * @access Public
   */
  async getItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await ItemsService.getItemById(req.params.id);
      sendSuccess(res, item, 'Item retrieved');
    } catch (error) {
      next(error);
    }
  },

  /**
   * @route  POST /api/items/:id/save
   * @access Private
   */
  async saveItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await ItemsService.saveItem(req.user!._id.toString(), req.params.id);
      sendSuccess(res, null, 'Item saved successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * @route  DELETE /api/items/:id/save
   * @access Private
   */
  async unsaveItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await ItemsService.unsaveItem(req.user!._id.toString(), req.params.id);
      sendSuccess(res, null, 'Item removed from saved list');
    } catch (error) {
      next(error);
    }
  },

  /**
   * @route  GET /api/me/saved
   * @access Private
   */
  async getSavedItems(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await ItemsService.getSavedItems(req.user!._id.toString());
      sendSuccess(res, items, 'Saved items retrieved');
    } catch (error) {
      next(error);
    }
  },
};
