import express from 'express';
import db from '../db/database.js';
import { authenticateToken, requireAdmin, requireCompetitor } from '../middleware/auth.js';

const router = express.Router();

// Get all competitors (admin only)
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const competitors = db.prepare(`
      SELECT c.*, u.email, u.name as user_name
      FROM competitors c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.last_name, c.first_name
    `).all();
    res.json(competitors);
  } catch (error) {
    console.error('Competitors fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch competitors' });
  }
});

// Get competitor by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const competitor = db.prepare(`
      SELECT c.*, u.email
      FROM competitors c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(req.params.id);

    if (!competitor) {
      return res.status(404).json({ error: 'Competitor not found' });
    }

    // Check if user can view this competitor
    if (req.user.role !== 'admin' && competitor.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get registrations for this competitor
    const registrations = db.prepare(`
      SELECT r.*, e.name as event_name, e.category, e.event_date, e.location
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.competitor_id = ?
      ORDER BY e.event_date
    `).all(req.params.id);

    res.json({ ...competitor, registrations });
  } catch (error) {
    console.error('Competitor fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch competitor' });
  }
});

// Get current user's competitor profile
router.get('/me/profile', authenticateToken, requireCompetitor, (req, res) => {
  try {
    const competitor = db.prepare(`
      SELECT c.*, u.email
      FROM competitors c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.user_id = ?
    `).get(req.user.id);

    if (!competitor) {
      return res.status(404).json({ error: 'Competitor profile not found. Please create one.' });
    }

    const registrations = db.prepare(`
      SELECT r.*, e.name as event_name, e.category, e.event_date, e.location
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.competitor_id = ?
      ORDER BY e.event_date
    `).all(competitor.id);

    res.json({ ...competitor, registrations });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch competitor profile' });
  }
});

// Create competitor profile
router.post('/', authenticateToken, requireCompetitor, (req, res) => {
  try {
    const {
      first_name, last_name, date_of_birth, gender, nationality,
      club, experience_level, emergency_contact_name, emergency_contact_phone
    } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    // Check if user already has a competitor profile
    const existing = db.prepare('SELECT id FROM competitors WHERE user_id = ?').get(req.user.id);
    if (existing) {
      return res.status(409).json({ error: 'Competitor profile already exists' });
    }

    const result = db.prepare(`
      INSERT INTO competitors (user_id, first_name, last_name, date_of_birth, gender, nationality, club, experience_level, emergency_contact_name, emergency_contact_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, first_name, last_name, date_of_birth, gender, nationality, club, experience_level, emergency_contact_name, emergency_contact_phone);

    const newCompetitor = db.prepare('SELECT * FROM competitors WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newCompetitor);
  } catch (error) {
    console.error('Competitor creation error:', error);
    res.status(500).json({ error: 'Failed to create competitor profile' });
  }
});

// Update competitor profile
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const competitor = db.prepare('SELECT * FROM competitors WHERE id = ?').get(req.params.id);

    if (!competitor) {
      return res.status(404).json({ error: 'Competitor not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && competitor.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const {
      first_name, last_name, date_of_birth, gender, nationality,
      club, experience_level, emergency_contact_name, emergency_contact_phone
    } = req.body;

    db.prepare(`
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
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(first_name, last_name, date_of_birth, gender, nationality, club, experience_level, emergency_contact_name, emergency_contact_phone, req.params.id);

    const updatedCompetitor = db.prepare('SELECT * FROM competitors WHERE id = ?').get(req.params.id);
    res.json(updatedCompetitor);
  } catch (error) {
    console.error('Competitor update error:', error);
    res.status(500).json({ error: 'Failed to update competitor profile' });
  }
});

// Delete competitor (admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const competitor = db.prepare('SELECT * FROM competitors WHERE id = ?').get(req.params.id);
    if (!competitor) {
      return res.status(404).json({ error: 'Competitor not found' });
    }

    db.prepare('DELETE FROM competitors WHERE id = ?').run(req.params.id);
    res.json({ message: 'Competitor deleted successfully' });
  } catch (error) {
    console.error('Competitor deletion error:', error);
    res.status(500).json({ error: 'Failed to delete competitor' });
  }
});

export default router;
