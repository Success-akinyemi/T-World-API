import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';

// ── Helpers

const registerPayload = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Password1',
};

// ── Test suite 

describe('Auth Routes', () => {
  beforeAll(async () => {
    // MONGODB_URI and JWT_SECRET are loaded from .env.test via tests/setup.ts
    await mongoose.connect(process.env.MONGODB_URI!);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  // ── POST /api/auth/register

  describe('POST /api/auth/register', () => {
    it('should register a new user and return a JWT', async () => {
      const res = await request(app).post('/api/auth/register').send(registerPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('email', registerPayload.email);
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should return 409 if email already exists', async () => {
      const res = await request(app).post('/api/auth/register').send(registerPayload);
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should return 422 for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...registerPayload, email: 'not-an-email' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 422 if password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...registerPayload, email: 'new@example.com', password: '123' });

      expect(res.status).toBe(422);
    });
  });

  // ── POST /api/auth/login 

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: registerPayload.email, password: registerPayload.password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: registerPayload.email, password: 'WrongPass1' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'Password1' });

      expect(res.status).toBe(401);
    });
  });
});