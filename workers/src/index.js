// Paisley Highland Games API - Cloudflare Workers Entry Point
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// Import routes
import authRoutes from './routes/auth.js';
import eventsRoutes from './routes/events.js';
import competitorsRoutes from './routes/competitors.js';
import registrationsRoutes from './routes/registrations.js';
import announcementsRoutes from './routes/announcements.js';
import contactRoutes from './routes/contact.js';
import resultsRoutes from './routes/results.js';

const app = new Hono();

// CORS middleware
app.use('*', cors({
  origin: (origin) => {
    // Allow requests from these origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      // Add your Cloudflare Pages domain here after deployment
      // 'https://paisley-highland-games.pages.dev',
    ];

    // In production, you might want to be more permissive or configure via env
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.pages.dev')) {
      return origin || '*';
    }
    return null;
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Logger middleware (only in development)
app.use('*', async (c, next) => {
  if (c.env.ENVIRONMENT === 'development') {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${c.req.method} ${c.req.path} - ${ms}ms`);
  } else {
    await next();
  }
});

// Mount routes
app.route('/api/auth', authRoutes);
app.route('/api/events', eventsRoutes);
app.route('/api/competitors', competitorsRoutes);
app.route('/api/registrations', registrationsRoutes);
app.route('/api/announcements', announcementsRoutes);
app.route('/api/contact', contactRoutes);
app.route('/api/results', resultsRoutes);

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'unknown'
  });
});

// API info
app.get('/api', (c) => {
  return c.json({
    name: 'Paisley Highland Games API',
    version: '1.0.0',
    runtime: 'Cloudflare Workers',
    endpoints: {
      auth: '/api/auth',
      events: '/api/events',
      competitors: '/api/competitors',
      registrations: '/api/registrations',
      announcements: '/api/announcements',
      contact: '/api/contact',
      results: '/api/results'
    }
  });
});

// Root redirect to API info
app.get('/', (c) => {
  return c.redirect('/api');
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Endpoint not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
