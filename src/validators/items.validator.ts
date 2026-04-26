import { query, param } from 'express-validator';

export const listItemsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('category')
    .optional()
    .isIn(['course', 'article', 'video', 'podcast', 'book'])
    .withMessage('Category must be one of: course, article, video, podcast, book'),

  query('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Level must be one of: beginner, intermediate, advanced'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Search query cannot exceed 200 characters'),
];

export const objectIdValidator = (field: string) => [
  param(field)
    .isMongoId().withMessage(`${field} must be a valid ID`),
];
