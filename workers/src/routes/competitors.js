// Competitors routes for Cloudflare Workers (Hono)
import { Hono } from 'hono';
import { authenticateToken, requireAdmin, requireCompetitor } from '../middleware/auth.js';

const competitors = new Hono();

// Get all competitors (admin only)
competitors.get('/', authenticateToken, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;

    const { results } = await db.prepare(`
      SELECT c.*, u.email, u.name as user_name
      FROM competitors c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.last_name, c.first_name
    `).all();

    return c.json(results);
  } catch (error) {
    console.error('Competitors fetch error:', error);
    return c.json({ error: 'Failed to fetch competitors' }, 500);
  }
});

// Get current user's competitor profile (must be before /:id)
competitors.get('/me/profile', authenticateToken, requireCompetitor, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('user').id;

    const competitor = await db.prepare(`
      SELECT c.*, u.email
      FROM competitors c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.user_id = ?
    `).bind(userId).first();

    if (!competitor) {
      return c.json({ error: 'Competitor profile not found. Please create one.' }, 404);
    }

    const { results: registrations } = await db.prepare(`
      SELECT r.*, e.name as event_name, e.category, e.event_date, e.location
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.competitor_id = ?
      ORDER BY e.event_date
    `).bind(competitor.id).all();

    return c.json({ ...competitor, registrations });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return c.json({ error: 'Failed to fetch competitor profile' }, 500);
  }
});

// Get competitor by ID
competitors.get('/:id', authenticateToken, async (c) => {
  try {
    const db = c.env.DB;
    const competitorId = c.req.param('id');
    const user = c.get('user');

    const competitor = await db.prepare(`
      SELECT c.*, u.email
      FROM competitors c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).bind(competitorId).first();

    if (!competitor) {
      return c.json({ error: 'Competitor not found' }, 404);
    }

    // Check if user can view this competitor
    if (user.role !== 'admin' && competitor.user_id !== user.id) {
      return c.json({ error: 'Access denied' }, 403);
    }

    // Get registrations for this competitor
    const { results: registrations } = await db.prepare(`
      SELECT r.*, e.name as event_name, e.category, e.event_date, e.location
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.competitor_id = ?
      ORDER BY e.event_date
    `).bind(competitorId).all();

    return c.json({ ...competitor, registrations });
  } catch (error) {
    console.error('Competitor fetch error:', error);
    return c.json({ error: 'Failed to fetch competitor' }, 500);
  }
});

// Create competitor profile
competitors.post('/', authenticateToken, requireCompetitor, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('user').id;
    const {
      first_name, last_name, date_of_birth, gender, nationality,
      club, experience_level, emergency_contact_name, emergency_contact_phone
    } = await c.req.json();

    if (!first_name || !last_name) {
      return c.json({ error: 'First name and last name are required' }, 400);
    }

    // Check if user already has a competitor profile
    const existing = await db.prepare('SELECT id FROM competitors WHERE user_id = ?').bind(userId).first();
    if (existing) {
      return c.json({ error: 'Competitor profile already exists' }, 409);
    }

    const result = await db.prepare(`
      INSERT INTO competitors (user_id, first_name, last_name, date_of_birth, gender, nationality, club, experience_level, emergency_contact_name, emergency_contact_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId, first_name, last_name, date_of_birth, gender,
      nationality, club, experience_level, emergency_contact_name, emergency_contact_phone
    ).run();

    const newCompetitor = await db.prepare('SELECT * FROM competitors WHERE id = ?')
      .bind(result.meta.last_row_id).first();

    return c.json(newCompetitor, 201);
  } catch (error) {
    console.error('Competitor creation error:', error);
    return c.json({ error: 'Failed to create competitor profile' }, 500);
  }
});

// Update competitor profile
competitors.put('/:id', authenticateToken, async (c) => {
  try {
    const db = c.env.DB;
    const competitorId = c.req.param('id');
    const user = c.get('user');

    const competitor = await db.prepare('SELECT * FROM competitors WHERE id = ?').bind(competitorId).first();

    if (!competitor) {
      return c.json({ error: 'Competitor not found' }, 404);
    }

    // Check authorization
    if (user.role !== 'admin' && competitor.user_id !== user.id) {
      return c.json({ error: 'Access denied' }, 403);
    }

    const {
      first_name, last_name, date_of_birth, gender, nationality,
      club, experience_level, emergency_contact_name, emergency_contact_phone
    } = await c.req.json();

    await db.prepare(`
      UPDATE competitors SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        date_of_birth = COALESCE(?, date_of_birth),
        gender = COALESCE(?, gender),
        nationality = COALESCE(?, nationality),
        club = COALESCE(?, club),
        experience_level = COALESCE(?, experience_level),
        emergency_contact_name = COALESCE(?, emergency_contact_name),
        emergency_contact_phone = COALESCE(?, emergency_contact_phone),
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      first_name, last_name, date_of_birth, gender, nationality,
      club, experience_level, emergency_contact_name, emergency_contact_phone, competitorId
    ).run();

    const updatedCompetitor = await db.prepare('SELECT * FROM competitors WHERE id = ?')
      .bind(competitorId).first();

    return c.json(updatedCompetitor);
  } catch (error) {
    console.error('Competitor update error:', error);
    return c.json({ error: 'Failed to update competitor profile' }, 500);
  }
});

// Delete competitor (admin only)
competitors.delete('/:id', authenticateToken, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const competitorId = c.req.param('id');

    const competitor = await db.prepare('SELECT * FROM competitors WHERE id = ?').bind(competitorId).first();
    if (!competitor) {
      return c.json({ error: 'Competitor not found' }, 404);
    }

    await db.prepare('DELETE FROM competitors WHERE id = ?').bind(competitorId).run();
    return c.json({ message: 'Competitor deleted successfully' });
  } catch (error) {
    console.error('Competitor deletion error:', error);
    return c.json({ error: 'Failed to delete competitor' }, 500);
  }
});

export default competitors;
