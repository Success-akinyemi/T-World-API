import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { Item } from '../src/db/models/Item';

let authToken: string;
let itemId: string;

const user = { name: 'Item Tester', email: 'items@example.com', password: 'Password1' };

describe('Items Routes', () => {
  beforeAll(async () => {
    // MONGODB_URI and JWT_SECRET are loaded from .env.test via tests/setup.ts
    await mongoose.connect(process.env.MONGODB_URI!);

    // Register and capture token
    const regRes = await request(app).post('/api/auth/register').send(user);
    authToken = regRes.body.data.token;

    // Seed one item directly
    const item = await Item.create({
      title: 'Test Item',
      description: 'A test learning item',
      category: 'article',
      tags: ['test'],
      author: 'Test Author',
      level: 'beginner',
    });
    itemId = (item._id as mongoose.Types.ObjectId).toString();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  // ── GET /api/items

  describe('GET /api/items', () => {
    it('should return paginated items', async () => {
      const res = await request(app).get('/api/items');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toHaveProperty('total');
      expect(res.body.meta).toHaveProperty('page');
    });

    it('should filter by category', async () => {
      const res = await request(app).get('/api/items?category=article');
      expect(res.status).toBe(200);
      res.body.data.forEach((item: { category: string }) => {
        expect(item.category).toBe('article');
      });
    });

    it('should return 422 for invalid category', async () => {
      const res = await request(app).get('/api/items?category=invalid');
      expect(res.status).toBe(422);
    });
  });

  // ── GET /api/items/:id

  describe('GET /api/items/:id', () => {
    it('should return a single item', async () => {
      const res = await request(app).get(`/api/items/${itemId}`);
      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(itemId);
    });

    it('should return 422 for an invalid ObjectId', async () => {
      const res = await request(app).get('/api/items/not-a-valid-id');
      expect(res.status).toBe(422);
    });

    it('should return 404 for a valid but missing id', async () => {
      const res = await request(app).get(`/api/items/${new mongoose.Types.ObjectId()}`);
      expect(res.status).toBe(404);
    });
  });

  // ── POST /api/items/:id/save

  describe('POST /api/items/:id/save', () => {
    it('should require authentication', async () => {
      const res = await request(app).post(`/api/items/${itemId}/save`);
      expect(res.status).toBe(401);
    });

    it('should save an item for authenticated user', async () => {
      const res = await request(app)
        .post(`/api/items/${itemId}/save`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
    });

    it('should return 409 if item already saved', async () => {
      const res = await request(app)
        .post(`/api/items/${itemId}/save`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(409);
    });
  });

  // ── GET /api/me/saved

  describe('GET /api/me/saved', () => {
    it('should return saved items for authenticated user', async () => {
      const res = await request(app)
        .get('/api/me/saved')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });

  // ── DELETE /api/items/:id/save

  describe('DELETE /api/items/:id/save', () => {
    it('should unsave a saved item', async () => {
      const res = await request(app)
        .delete(`/api/items/${itemId}/save`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
    });

    it('should return 404 if item was not saved', async () => {
      const res = await request(app)
        .delete(`/api/items/${itemId}/save`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(404);
    });
  });
});