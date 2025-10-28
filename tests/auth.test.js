const request = require('supertest');
const app = require('../server/app');
const User = require('../server/models/User');
const { hashPassword } = require('../server/utils/password');

describe('Auth API', () => {
  it('registers a user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('prevents duplicate registration', async () => {
    const hashed = await hashPassword('password123');
    await User.create({
      name: 'Existing',
      email: 'existing@example.com',
      password: hashed,
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Existing',
      email: 'existing@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(400);
  });

  it('logs in a user with valid credentials', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login User',
      email: 'login@example.com',
      password: 'password123',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
