// Express app: middleware pipeline + routes, exported without listen().
// server.js starts it; tests import it directly with supertest.
import express from 'express';
import cors from 'cors';
import logger from './middleware/logger.js';
import responseTime from './middleware/responseTime.js';
import errorHandler from './middleware/errorHandler.js';
import contentType from './middleware/contentType.js';
import notFound from './middleware/notFound.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import cacheRoutes from './routes/cacheRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();

// Middleware pipeline (order matters)
app.use(cors());
app.use(responseTime);  // 0. start the X-Response-Time timer
app.use(logger);        // 1. log every incoming request
app.use(contentType);   // 2. reject non-JSON POST/PUT before parsing
app.use(express.json()); // 3. parse the JSON body

// Root route - API Welcome
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Task Management RESTful API (JWT Auth + node-cache + EventEmitter + MongoDB)',
    version: '6.0.0',
    endpoints: {
      'POST /api/auth/register': 'Register a new user (public)',
      'POST /api/auth/login': 'Log in and receive a JWT (public)',
      'GET /api/auth/me': 'Current user details (protected)',
      'GET /api/tasks': 'Get all tasks of the user (protected)',
      'GET /api/tasks/:id': 'Get a specific task (protected)',
      'POST /api/tasks': 'Create a new task (protected)',
      'PUT /api/tasks/:id': 'Update a task (protected)',
      'DELETE /api/tasks/:id': 'Delete a task (protected)',
      'GET /api/cache/stats': 'Cache hit/miss counters (protected, debug)',
      'DELETE /api/cache': 'Flush cache and reset counters (protected, debug)',
      'GET /api/notifications': 'Notifications produced by background event listeners (protected)',
      'DELETE /api/notifications': 'Clear notifications (protected)'
    },
    events: 'POST/PUT/DELETE /api/tasks emit task-created / task-updated / task-deleted after responding',
    cache: 'GET responses carry X-Cache: HIT | MISS and X-Response-Time headers',
    auth: 'Send header  Authorization: Bearer <token>  on protected routes',
    documentation: 'See README.md for full API documentation'
  });
});

// Public auth routes
app.use('/api/auth', authRoutes);

// Protected task routes (auth middleware applied inside the router)
app.use('/api/tasks', taskRoutes);

// Cache debug routes
app.use('/api/cache', cacheRoutes);

// Notifications written by the event listeners
app.use('/api/notifications', notificationRoutes);

// 404 Handler for undefined routes (after all routes)
app.use(notFound);

// Error Handler Middleware (must be last)
app.use(errorHandler);

export default app;
