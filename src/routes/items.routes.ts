import { Router } from 'express';
import { ItemsController } from '../controllers/items.controller';
import { listItemsValidator, objectIdValidator } from '../validators/items.validator';
import { validate } from '../middlewares/validate.middleware';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Items
 *   description: Learning content items
 */

/**
 * @swagger
 * /items:
 *   get:
 *     summary: List all items with pagination and optional filters
 *     tags: [Items]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page (max 100)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [course, article, video, podcast, book]
 *         description: Filter by category
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by difficulty level
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Full-text search on title and description
 *     responses:
 *       200:
 *         description: Paginated list of items
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
 *                     meta:
 *                       $ref: '#/components/schemas/PaginationMeta'
 */
router.get('/', listItemsValidator, validate, ItemsController.listItems);

/**
 * @swagger
 * /items/{id}:
 *   get:
 *     summary: Get a single item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the item
 *     responses:
 *       200:
 *         description: Item found
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', ...objectIdValidator('id'), validate, ItemsController.getItem);

/**
 * @swagger
 * /items/{id}/save:
 *   post:
 *     summary: Save an item to the authenticated user's list
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Item not found
 *       409:
 *         description: Item already saved
 */
router.post('/:id/save', protect, ...objectIdValidator('id'), validate, ItemsController.saveItem);

/**
 * @swagger
 * /items/{id}/save:
 *   delete:
 *     summary: Remove an item from the authenticated user's saved list
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from saved list
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Saved item not found
 */
router.delete('/:id/save', protect, ...objectIdValidator('id'), validate, ItemsController.unsaveItem);

export default router;
