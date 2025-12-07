// Events routes for Cloudflare Workers (Hono)
import { Hono } from 'hono';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const events = new Hono();

// Get all events (public)
events.get('/', async (c) => {
  try {
    const db = c.env.DB;
    const { category, date, search } = c.req.query();

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

    const stmt = db.prepare(query);
    const boundStmt = params.length > 0 ? stmt.bind(...params) : stmt;
    const { results: eventsList } = await boundStmt.all();

    // Get registration count for each event
    const eventsWithCount = await Promise.all(eventsList.map(async (event) => {
      const count = await db.prepare(
        'SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status != ?'
      ).bind(event.id, 'cancelled').first();

      return {
        ...event,
        registered_count: count.count,
        spots_available: event.max_participants - count.count
      };
    }));

    return c.json(eventsWithCount);
  } catch (error) {
    console.error('Events fetch error:', error);
    return c.json({ error: 'Failed to fetch events' }, 500);
  }
});

// Get event categories (must be before /:id to avoid conflict)
events.get('/meta/categories', (c) => {
  return c.json([
    { value: 'heavy', label: 'Heavy Events', description: 'Traditional strength competitions' },
    { value: 'dancing', label: 'Highland Dancing', description: 'Traditional Scottish dance' },
    { value: 'piping', label: 'Piping & Drumming', description: 'Bagpipe and drum competitions' },
    { value: 'athletics', label: 'Athletics', description: 'Running and team events' },
    { value: 'other', label: 'Other Events', description: 'Other activities and competitions' }
  ]);
});

// Get single event by ID (public)
events.get('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const eventId = c.req.param('id');

    const event = await db.prepare('SELECT * FROM events WHERE id = ?').bind(eventId).first();

    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    // Get registration count
    const count = await db.prepare(
      'SELECT COUNT(*) as count FROM registrations WHERE event_id = ? AND status != ?'
    ).bind(event.id, 'cancelled').first();

    // Get registered competitors
    const { results: registrations } = await db.prepare(`
      SELECT r.*, c.first_name, c.last_name, c.club, c.nationality
      FROM registrations r
      JOIN competitors c ON r.competitor_id = c.id
      WHERE r.event_id = ? AND r.status != ?
      ORDER BY r.registration_date
    `).bind(event.id, 'cancelled').all();

    return c.json({
      ...event,
      registered_count: count.count,
      spots_available: event.max_participants - count.count,
      registrations
    });
  } catch (error) {
    console.error('Event fetch error:', error);
    return c.json({ error: 'Failed to fetch event' }, 500);
  }
});

// Create new event (admin only)
events.post('/', authenticateToken, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const {
      name, description, category, location, event_date,
      start_time, end_time, max_participants, registration_fee, image_url
    } = await c.req.json();

    if (!name || !category) {
      return c.json({ error: 'Name and category are required' }, 400);
    }

    const result = await db.prepare(`
      INSERT INTO events (name, description, category, location, event_date, start_time, end_time, max_participants, registration_fee, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      name, description, category, location, event_date,
      start_time, end_time, max_participants || 50, registration_fee || 0, image_url
    ).run();

    const newEvent = await db.prepare('SELECT * FROM events WHERE id = ?')
      .bind(result.meta.last_row_id).first();

    return c.json(newEvent, 201);
  } catch (error) {
    console.error('Event creation error:', error);
    return c.json({ error: 'Failed to create event' }, 500);
  }
});

// Update event (admin only)
events.put('/:id', authenticateToken, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const eventId = c.req.param('id');
    const {
      name, description, category, location, event_date,
      start_time, end_time, max_participants, registration_fee, image_url
    } = await c.req.json();

    const existing = await db.prepare('SELECT * FROM events WHERE id = ?').bind(eventId).first();
    if (!existing) {
      return c.json({ error: 'Event not found' }, 404);
    }

    await db.prepare(`
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
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      name, description, category, location, event_date,
      start_time, end_time, max_participants, registration_fee, image_url, eventId
    ).run();

    const updatedEvent = await db.prepare('SELECT * FROM events WHERE id = ?').bind(eventId).first();
    return c.json(updatedEvent);
  } catch (error) {
    console.error('Event update error:', error);
    return c.json({ error: 'Failed to update event' }, 500);
  }
});

// Delete event (admin only)
events.delete('/:id', authenticateToken, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const eventId = c.req.param('id');

    const existing = await db.prepare('SELECT * FROM events WHERE id = ?').bind(eventId).first();
    if (!existing) {
      return c.json({ error: 'Event not found' }, 404);
    }

    await db.prepare('DELETE FROM events WHERE id = ?').bind(eventId).run();
    return c.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Event deletion error:', error);
    return c.json({ error: 'Failed to delete event' }, 500);
  }
});

export default events;
