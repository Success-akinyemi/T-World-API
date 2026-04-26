import { Router } from 'express';
import { ItemsController } from '../controllers/items.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Me
 *   description: Authenticated user profile endpoints
 */

/**
 * @swagger
 * /me/saved:
 *   get:
 *     summary: Get all items saved by the authenticated user
 *     tags: [Me]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of saved items
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Item'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/saved', protect, ItemsController.getSavedItems);

export default router;
