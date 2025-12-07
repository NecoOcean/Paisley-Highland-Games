import express from 'express';
import db from '../db/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all events (public)
router.get('/', (req, res) => {
  try {
    const { category, date, search } = req.query;

    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (date) {
      query += ' AND event_date = ?';
      params.push(date);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY event_date, start_time';

    const events = db.prepare(query).all(...params);

    // Get registration count for each event
    const eventsWithCount = events.map(event => {
      const count = db.prepare(
        'SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status != ?'
      ).get(event.id, 'cancelled');
      return {
        ...event,
        registered_count: count.count,
        spots_available: event.max_participants - count.count
      };
    });

    res.json(eventsWithCount);
  } catch (error) {
    console.error('Events fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event by ID (public)
router.get('/:id', (req, res) => {
  try {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get registration count
    const count = db.prepare(
      'SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status != ?'
    ).get(event.id, 'cancelled');

    // Get registered competitors
    const registrations = db.prepare(`
      SELECT r.*, c.first_name, c.last_name, c.club, c.nationality
      FROM registrations r
      JOIN competitors c ON r.competitor_id = c.id
      WHERE r.event_id = ? AND r.status != ?
      ORDER BY r.registration_date
    `).all(event.id, 'cancelled');

    res.json({
      ...event,
      registered_count: count.count,
      spots_available: event.max_participants - count.count,
      registrations
    });
  } catch (error) {
    console.error('Event fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create new event (admin only)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const {
      name, description, category, location, event_date,
      start_time, end_time, max_participants, registration_fee, image_url
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    const result = db.prepare(`
      INSERT INTO events (name, description, category, location, event_date, start_time, end_time, max_participants, registration_fee, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, description, category, location, event_date, start_time, end_time, max_participants || 50, registration_fee || 0, image_url);

    const newEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Event creation error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event (admin only)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const {
      name, description, category, location, event_date,
      start_time, end_time, max_participants, registration_fee, image_url
    } = req.body;

    const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    db.prepare(`
      UPDATE events SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        location = COALESCE(?, location),
        event_date = COALESCE(?, event_date),
        start_time = COALESCE(?, start_time),
        end_time = COALESCE(?, end_time),
        max_participants = COALESCE(?, max_participants),
        registration_fee = COALESCE(?, registration_fee),
        image_url = COALESCE(?, image_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, description, category, location, event_date, start_time, end_time, max_participants, registration_fee, image_url, req.params.id);

    const updatedEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    res.json(updatedEvent);
  } catch (error) {
    console.error('Event update error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event (admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Event deletion error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Get event categories
router.get('/meta/categories', (req, res) => {
  res.json([
    { value: 'heavy', label: 'Heavy Events', description: 'Traditional strength competitions' },
    { value: 'dancing', label: 'Highland Dancing', description: 'Traditional Scottish dance' },
    { value: 'piping', label: 'Piping & Drumming', description: 'Bagpipe and drum competitions' },
    { value: 'athletics', label: 'Athletics', description: 'Running and team events' },
    { value: 'other', label: 'Other Events', description: 'Other activities and competitions' }
  ]);
});

export default router;
