import express from 'express';
import db from '../db/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get results for an event (public)
router.get('/event/:eventId', (req, res) => {
  try {
    const results = db.prepare(`
      SELECT r.*, c.first_name, c.last_name, c.club, c.nationality
      FROM results r
      JOIN competitors c ON r.competitor_id = c.id
      WHERE r.event_id = ?
      ORDER BY r.rank ASC, r.score DESC
    `).all(req.params.eventId);

    res.json(results);
  } catch (error) {
    console.error('Results fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// Get all results for a competitor
router.get('/competitor/:competitorId', authenticateToken, (req, res) => {
  try {
    const results = db.prepare(`
      SELECT r.*, e.name as event_name, e.category, e.event_date
      FROM results r
      JOIN events e ON r.event_id = e.id
      WHERE r.competitor_id = ?
      ORDER BY e.event_date DESC
    `).all(req.params.competitorId);

    res.json(results);
  } catch (error) {
    console.error('Competitor results fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// Record result (admin only)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { event_id, competitor_id, score, unit, rank, notes } = req.body;

    if (!event_id || !competitor_id) {
      return res.status(400).json({ error: 'Event ID and competitor ID are required' });
    }

    // Verify event and competitor exist
    const event = db.prepare('SELECT id FROM events WHERE id = ?').get(event_id);
    const competitor = db.prepare('SELECT id FROM competitors WHERE id = ?').get(competitor_id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (!competitor) {
      return res.status(404).json({ error: 'Competitor not found' });
    }

    // Check if result already exists
    const existing = db.prepare(
      'SELECT id FROM results WHERE event_id = ? AND competitor_id = ?'
    ).get(event_id, competitor_id);

    if (existing) {
      return res.status(409).json({ error: 'Result already recorded for this competitor in this event' });
    }

    const result = db.prepare(`
      INSERT INTO results (event_id, competitor_id, score, unit, rank, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(event_id, competitor_id, score, unit, rank, notes);

    const newResult = db.prepare(`
      SELECT r.*, c.first_name, c.last_name, e.name as event_name
      FROM results r
      JOIN competitors c ON r.competitor_id = c.id
      JOIN events e ON r.event_id = e.id
      WHERE r.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(newResult);
  } catch (error) {
    console.error('Result recording error:', error);
    res.status(500).json({ error: 'Failed to record result' });
  }
});

// Update result (admin only)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { score, unit, rank, notes } = req.body;

    const existing = db.prepare('SELECT * FROM results WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Result not found' });
    }

    db.prepare(`
      UPDATE results SET
        score = COALESCE(?, score),
        unit = COALESCE(?, unit),
        rank = COALESCE(?, rank),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(score, unit, rank, notes, req.params.id);

    const updatedResult = db.prepare(`
      SELECT r.*, c.first_name, c.last_name, e.name as event_name
      FROM results r
      JOIN competitors c ON r.competitor_id = c.id
      JOIN events e ON r.event_id = e.id
      WHERE r.id = ?
    `).get(req.params.id);

    res.json(updatedResult);
  } catch (error) {
    console.error('Result update error:', error);
    res.status(500).json({ error: 'Failed to update result' });
  }
});

// Delete result (admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM results WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Result not found' });
    }

    db.prepare('DELETE FROM results WHERE id = ?').run(req.params.id);
    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    console.error('Result deletion error:', error);
    res.status(500).json({ error: 'Failed to delete result' });
  }
});

// Get leaderboard for an event
router.get('/leaderboard/:eventId', (req, res) => {
  try {
    const results = db.prepare(`
      SELECT r.*, c.first_name, c.last_name, c.club, c.nationality
      FROM results r
      JOIN competitors c ON r.competitor_id = c.id
      WHERE r.event_id = ?
      ORDER BY r.rank ASC
      LIMIT 10
    `).all(req.params.eventId);

    res.json(results);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
