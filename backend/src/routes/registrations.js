import express from 'express';
import db from '../db/database.js';
import { authenticateToken, requireAdmin, requireCompetitor } from '../middleware/auth.js';

const router = express.Router();

// Get all registrations (admin only)
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { event_id, status, payment_status } = req.query;

    let query = `
      SELECT r.*,
        e.name as event_name, e.category, e.event_date,
        c.first_name, c.last_name, c.club
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      JOIN competitors c ON r.competitor_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (event_id) {
      query += ' AND r.event_id = ?';
      params.push(event_id);
    }

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }

    if (payment_status) {
      query += ' AND r.payment_status = ?';
      params.push(payment_status);
    }

    query += ' ORDER BY r.registration_date DESC';

    const registrations = db.prepare(query).all(...params);
    res.json(registrations);
  } catch (error) {
    console.error('Registrations fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// Get user's registrations
router.get('/my-registrations', authenticateToken, requireCompetitor, (req, res) => {
  try {
    const competitor = db.prepare('SELECT id FROM competitors WHERE user_id = ?').get(req.user.id);

    if (!competitor) {
      return res.status(404).json({ error: 'Competitor profile not found' });
    }

    const registrations = db.prepare(`
      SELECT r.*,
        e.name as event_name, e.category, e.event_date, e.start_time, e.location, e.registration_fee
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.competitor_id = ?
      ORDER BY e.event_date, e.start_time
    `).all(competitor.id);

    res.json(registrations);
  } catch (error) {
    console.error('My registrations fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// Register for an event
router.post('/', authenticateToken, requireCompetitor, (req, res) => {
  try {
    const { event_id, notes } = req.body;

    if (!event_id) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    // Get competitor ID for current user
    const competitor = db.prepare('SELECT id FROM competitors WHERE user_id = ?').get(req.user.id);
    if (!competitor) {
      return res.status(400).json({ error: 'Please create a competitor profile first' });
    }

    // Check if event exists and has spots
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(event_id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check current registration count
    const count = db.prepare(
      'SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status != ?'
    ).get(event_id, 'cancelled');

    if (count.count >= event.max_participants) {
      return res.status(400).json({ error: 'Event is full' });
    }

    // Check if already registered
    const existing = db.prepare(
      'SELECT id FROM registrations WHERE event_id = ? AND competitor_id = ?'
    ).get(event_id, competitor.id);

    if (existing) {
      return res.status(409).json({ error: 'Already registered for this event' });
    }

    // Create registration
    const result = db.prepare(`
      INSERT INTO registrations (event_id, competitor_id, status, payment_status, notes)
      VALUES (?, ?, 'pending', 'unpaid', ?)
    `).run(event_id, competitor.id, notes);

    const registration = db.prepare(`
      SELECT r.*, e.name as event_name, e.category, e.event_date, e.registration_fee
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(registration);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register for event' });
  }
});

// Update registration status (admin only)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { status, payment_status, notes } = req.body;

    const existing = db.prepare('SELECT * FROM registrations WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    db.prepare(`
      UPDATE registrations SET
        status = COALESCE(?, status),
        payment_status = COALESCE(?, payment_status),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, payment_status, notes, req.params.id);

    const registration = db.prepare(`
      SELECT r.*, e.name as event_name, c.first_name, c.last_name
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      JOIN competitors c ON r.competitor_id = c.id
      WHERE r.id = ?
    `).get(req.params.id);

    res.json(registration);
  } catch (error) {
    console.error('Registration update error:', error);
    res.status(500).json({ error: 'Failed to update registration' });
  }
});

// Cancel registration
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const registration = db.prepare(`
      SELECT r.*, c.user_id
      FROM registrations r
      JOIN competitors c ON r.competitor_id = c.id
      WHERE r.id = ?
    `).get(req.params.id);

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && registration.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update to cancelled instead of deleting
    db.prepare(`
      UPDATE registrations SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(req.params.id);

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Registration cancellation error:', error);
    res.status(500).json({ error: 'Failed to cancel registration' });
  }
});

export default router;
