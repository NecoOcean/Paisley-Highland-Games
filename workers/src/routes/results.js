// Results routes for Cloudflare Workers (Hono)
import { Hono } from 'hono';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const results = new Hono();

// Get results for an event (public)
results.get('/event/:eventId', async (c) => {
  try {
    const db = c.env.DB;
    const eventId = c.req.param('eventId');

    const { results: resultsList } = await db.prepare(`
      SELECT r.*, c.first_name, c.last_name, c.club, c.nationality
      FROM results r
      JOIN competitors c ON r.competitor_id = c.id
      WHERE r.event_id = ?
      ORDER BY r.rank ASC, r.score DESC
    `).bind(eventId).all();

    return c.json(resultsList);
  } catch (error) {
    console.error('Results fetch error:', error);
    return c.json({ error: 'Failed to fetch results' }, 500);
  }
});

// Get leaderboard for an event
results.get('/leaderboard/:eventId', async (c) => {
  try {
    const db = c.env.DB;
    const eventId = c.req.param('eventId');

    const { results: resultsList } = await db.prepare(`
      SELECT r.*, c.first_name, c.last_name, c.club, c.nationality
      FROM results r
      JOIN competitors c ON r.competitor_id = c.id
      WHERE r.event_id = ?
      ORDER BY r.rank ASC
      LIMIT 10
    `).bind(eventId).all();

    return c.json(resultsList);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return c.json({ error: 'Failed to fetch leaderboard' }, 500);
  }
});

// Get all results for a competitor
results.get('/competitor/:competitorId', authenticateToken, async (c) => {
  try {
    const db = c.env.DB;
    const competitorId = c.req.param('competitorId');

    const { results: resultsList } = await db.prepare(`
      SELECT r.*, e.name as event_name, e.category, e.event_date
      FROM results r
      JOIN events e ON r.event_id = e.id
      WHERE r.competitor_id = ?
      ORDER BY e.event_date DESC
    `).bind(competitorId).all();

    return c.json(resultsList);
  } catch (error) {
    console.error('Competitor results fetch error:', error);
    return c.json({ error: 'Failed to fetch results' }, 500);
  }
});

// Record result (admin only)
results.post('/', authenticateToken, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const { event_id, competitor_id, score, unit, rank, notes } = await c.req.json();

    if (!event_id || !competitor_id) {
      return c.json({ error: 'Event ID and competitor ID are required' }, 400);
    }

    // Verify event and competitor exist
    const event = await db.prepare('SELECT id FROM events WHERE id = ?').bind(event_id).first();
    const competitor = await db.prepare('SELECT id FROM competitors WHERE id = ?').bind(competitor_id).first();

    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }
    if (!competitor) {
      return c.json({ error: 'Competitor not found' }, 404);
    }

    // Check if result already exists
    const existing = await db.prepare(
      'SELECT id FROM results WHERE event_id = ? AND competitor_id = ?'
    ).bind(event_id, competitor_id).first();

    if (existing) {
      return c.json({ error: 'Result already recorded for this competitor in this event' }, 409);
    }

    const result = await db.prepare(`
      INSERT INTO results (event_id, competitor_id, score, unit, rank, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(event_id, competitor_id, score, unit, rank, notes).run();

    const newResult = await db.prepare(`
      SELECT r.*, c.first_name, c.last_name, e.name as event_name
      FROM results r
      JOIN competitors c ON r.competitor_id = c.id
      JOIN events e ON r.event_id = e.id
      WHERE r.id = ?
    `).bind(result.meta.last_row_id).first();

    return c.json(newResult, 201);
  } catch (error) {
    console.error('Result recording error:', error);
    return c.json({ error: 'Failed to record result' }, 500);
  }
});

// Update result (admin only)
results.put('/:id', authenticateToken, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const resultId = c.req.param('id');
    const { score, unit, rank, notes } = await c.req.json();

    const existing = await db.prepare('SELECT * FROM results WHERE id = ?').bind(resultId).first();
    if (!existing) {
      return c.json({ error: 'Result not found' }, 404);
    }

    await db.prepare(`
      UPDATE results SET
        score = COALESCE(?, score),
        unit = COALESCE(?, unit),
        rank = COALESCE(?, rank),
        notes = COALESCE(?, notes),
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(score, unit, rank, notes, resultId).run();

    const updatedResult = await db.prepare(`
      SELECT r.*, c.first_name, c.last_name, e.name as event_name
      FROM results r
      JOIN competitors c ON r.competitor_id = c.id
      JOIN events e ON r.event_id = e.id
      WHERE r.id = ?
    `).bind(resultId).first();

    return c.json(updatedResult);
  } catch (error) {
    console.error('Result update error:', error);
    return c.json({ error: 'Failed to update result' }, 500);
  }
});

// Delete result (admin only)
results.delete('/:id', authenticateToken, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const resultId = c.req.param('id');

    const existing = await db.prepare('SELECT * FROM results WHERE id = ?').bind(resultId).first();
    if (!existing) {
      return c.json({ error: 'Result not found' }, 404);
    }

    await db.prepare('DELETE FROM results WHERE id = ?').bind(resultId).run();
    return c.json({ message: 'Result deleted successfully' });
  } catch (error) {
    console.error('Result deletion error:', error);
    return c.json({ error: 'Failed to delete result' }, 500);
  }
});

export default results;
