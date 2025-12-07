import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import eventsRoutes from './routes/events.js';
import competitorsRoutes from './routes/competitors.js';
import registrationsRoutes from './routes/registrations.js';
import announcementsRoutes from './routes/announcements.js';
import contactRoutes from './routes/contact.js';
import resultsRoutes from './routes/results.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/competitors', competitorsRoutes);
app.use('/api/registrations', registrationsRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/results', resultsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API info
app.get('/api', (req, res) => {
  res.json({
    name: 'Paisley Highland Games API',
    version: '1.0.0',
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏴󠁧󠁢󠁳󠁣󠁴󠁿  Paisley Highland Games API Server  🏴󠁧󠁢󠁳󠁣󠁴󠁿            ║
║                                                           ║
║   Server running on http://localhost:${PORT}               ║
║   API documentation: http://localhost:${PORT}/api          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
