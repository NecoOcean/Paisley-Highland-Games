// Registrations routes for Cloudflare Workers (Hono)
import { Hono } from 'hono';
import { authenticateToken, requireAdmin, requireCompetitor } from '../middleware/auth.js';

const registrations = new Hono();

// Get all registrations (admin only)
registrations.get('/', authenticateToken, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const { event_id, status, payment_status } = c.req.query();

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

    const stmt = db.prepare(query);
    const boundStmt = params.length > 0 ? stmt.bind(...params) : stmt;
    const { results } = await boundStmt.all();

    return c.json(results);
  } catch (error) {
    console.error('Registrations fetch error:', error);
    return c.json({ error: 'Failed to fetch registrations' }, 500);
  }
});

// Get user's registrations
registrations.get('/my-registrations', authenticateToken, requireCompetitor, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('user').id;

    const competitor = await db.prepare('SELECT id FROM competitors WHERE user_id = ?').bind(userId).first();

    if (!competitor) {
      return c.json({ error: 'Competitor profile not found' }, 404);
    }

    const { results } = await db.prepare(`
      SELECT r.*,
        e.name as event_name, e.category, e.event_date, e.start_time, e.location, e.registration_fee
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.competitor_id = ?
      ORDER BY e.event_date, e.start_time
    `).bind(competitor.id).all();

    return c.json(results);
  } catch (error) {
    console.error('My registrations fetch error:', error);
    return c.json({ error: 'Failed to fetch registrations' }, 500);
  }
});

// Register for an event
registrations.post('/', authenticateToken, requireCompetitor, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('user').id;
    const { event_id, notes } = await c.req.json();

    if (!event_id) {
      return c.json({ error: 'Event ID is required' }, 400);
    }

    // Get competitor ID for current user
    const competitor = await db.prepare('SELECT id FROM competitors WHERE user_id = ?').bind(userId).first();
    if (!competitor) {
      return c.json({ error: 'Please create a competitor profile first' }, 400);
    }

    // Check if event exists and has spots
    const event = await db.prepare('SELECT * FROM events WHERE id = ?').bind(event_id).first();
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    // Check current registration count
    const count = await db.prepare(
      'SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status != ?'
    ).bind(event_id, 'cancelled').first();

    if (count.count >= event.max_participants) {
      return c.json({ error: 'Event is full' }, 400);
    }

    // Check if already registered
    const existing = await db.prepare(
      'SELECT id FROM registrations WHERE event_id = ? AND competitor_id = ?'
    ).bind(event_id, competitor.id).first();

    if (existing) {
      return c.json({ error: 'Already registered for this event' }, 409);
    }

    // Create registration
    const result = await db.prepare(`
      INSERT INTO registrations (event_id, competitor_id, status, payment_status, notes)
      VALUES (?, ?, 'pending', 'unpaid', ?)
    `).bind(event_id, competitor.id, notes).run();

    const registration = await db.prepare(`
      SELECT r.*, e.name as event_name, e.category, e.event_date, e.registration_fee
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.id = ?
    `).bind(result.meta.last_row_id).first();

    return c.json(registration, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Failed to register for event' }, 500);
  }
});

// Update registration status (admin only)
registrations.put('/:id', authenticateToken, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const registrationId = c.req.param('id');
    const { status, payment_status, notes } = await c.req.json();

    const existing = await db.prepare('SELECT * FROM registrations WHERE id = ?').bind(registrationId).first();
    if (!existing) {
      return c.json({ error: 'Registration not found' }, 404);
    }

    await db.prepare(`
      UPDATE registrations SET
        status = COALESCE(?, status),
        payment_status = COALESCE(?, payment_status),
        notes = COALESCE(?, notes),
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(status, payment_status, notes, registrationId).run();

    const registration = await db.prepare(`
      SELECT r.*, e.name as event_name, c.first_name, c.last_name
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      JOIN competitors c ON r.competitor_id = c.id
      WHERE r.id = ?
    `).bind(registrationId).first();

    return c.json(registration);
  } catch (error) {
    console.error('Registration update error:', error);
    return c.json({ error: 'Failed to update registration' }, 500);
  }
});

// Cancel registration
registrations.delete('/:id', authenticateToken, async (c) => {
  try {
    const db = c.env.DB;
    const registrationId = c.req.param('id');
    const user = c.get('user');

    const registration = await db.prepare(`
      SELECT r.*, c.user_id
      FROM registrations r
      JOIN competitors c ON r.competitor_id = c.id
      WHERE r.id = ?
    `).bind(registrationId).first();

    if (!registration) {
      return c.json({ error: 'Registration not found' }, 404);
    }

    // Check authorization
    if (user.role !== 'admin' && registration.user_id !== user.id) {
      return c.json({ error: 'Access denied' }, 403);
    }

    // Update to cancelled instead of deleting
    await db.prepare(`
      UPDATE registrations SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?
    `).bind(registrationId).run();

    return c.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Registration cancellation error:', error);
    return c.json({ error: 'Failed to cancel registration' }, 500);
  }
});

export default registrations;
