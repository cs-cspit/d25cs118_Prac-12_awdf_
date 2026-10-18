// API tests with Jest + supertest. supertest calls the Express app in memory
// (no port is opened); MongoDB is a real database - a local one when run on a
// laptop, the mongo:7 service container in GitHub Actions.
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import mongoose from 'mongoose';
import request from 'supertest';

process.env.JWT_SECRET ||= 'ci-test-secret';
const MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/taskmanager_test';

const { default: app } = await import('../app.js');

describe('Public routes', () => {
  test('GET /api returns 200 with the API description', async () => {
    const res = await request(app).get('/api');

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Task Management RESTful API/);
  });

  test('unknown route returns 404', async () => {
    const res = await request(app).get('/api/does-not-exist');

    expect(res.statusCode).toBe(404);
  });
});

describe('Task routes (JWT protected)', () => {
  let token;

  beforeAll(async () => {
    await mongoose.connect(MONGO_URI);
    await mongoose.connection.dropDatabase();

    const user = { name: 'CI User', email: 'ci@example.com', password: 'secret123' };
    await request(app).post('/api/auth/register').send(user);
    const login = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
    token = login.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  test('GET /api/tasks without a token returns 401', async () => {
    const res = await request(app).get('/api/tasks');

    expect(res.statusCode).toBe(401);
  });

  test('GET /api/tasks returns 200', async () => {
    const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/tasks creates a task and returns 201', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Write CI pipeline', priority: 'high' });

    expect(res.statusCode).toBe(201);
    expect(res.body.task.title).toBe('Write CI pipeline');
    expect(res.body.task.completed).toBe(false);
  });

  test('POST /api/tasks without a title returns 400', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'no title' });

    expect(res.statusCode).toBe(400);
  });

  test('GET /api/tasks lists the created task', async () => {
    const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Write CI pipeline');
  });
});
