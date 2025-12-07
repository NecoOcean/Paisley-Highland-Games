import express from 'express';
import db from '../db/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all published announcements (public)
router.get('/', (req, res) => {
  try {
    const { limit } = req.query;

    let query = `
      SELECT a.*, u.name as author_name
      FROM announcements a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.is_published = 1
      ORDER BY a.published_at DESC
    `;

    if (limit) {
      query += ` LIMIT ${parseInt(limit)}`;
    }

    const announcements = db.prepare(query).all();
    res.json(announcements);
  } catch (error) {
    console.error('Announcements fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Get single announcement (public)
router.get('/:id', (req, res) => {
  try {
    const announcement = db.prepare(`
      SELECT a.*, u.name as author_name
      FROM announcements a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.id = ? AND a.is_published = 1
    `).get(req.params.id);

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json(announcement);
  } catch (error) {
    console.error('Announcement fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch announcement' });
  }
});

// Get all announcements including drafts (admin only)
router.get('/admin/all', authenticateToken, requireAdmin, (req, res) => {
  try {
    const announcements = db.prepare(`
      SELECT a.*, u.name as author_name
      FROM announcements a
      LEFT JOIN users u ON a.author_id = u.id
      ORDER BY a.created_at DESC
    `).all();
    res.json(announcements);
  } catch (error) {
    console.error('Admin announcements fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Create announcement (admin only)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { title, content, is_published = true } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const result = db.prepare(`
      INSERT INTO announcements (title, content, author_id, is_published, published_at)
      VALUES (?, ?, ?, ?, ${is_published ? 'CURRENT_TIMESTAMP' : 'NULL'})
    `).run(title, content, req.user.id, is_published ? 1 : 0);

    const announcement = db.prepare('SELECT * FROM announcements WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(announcement);
  } catch (error) {
    console.error('Announcement creation error:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// Update announcement (admin only)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { title, content, is_published } = req.body;

    const existing = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // If publishing for first time, set published_at
    let publishedAt = existing.published_at;
    if (is_published && !existing.is_published) {
      publishedAt = new Date().toISOString();
    }

    db.prepare(`
      UPDATE announcements SET
        title = COALESCE(?, title),
        content = COALESCE(?, content),
        is_published = COALESCE(?, is_published),
        published_at = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title, content, is_published !== undefined ? (is_published ? 1 : 0) : null, publishedAt, req.params.id);

    const announcement = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
    res.json(announcement);
  } catch (error) {
    console.error('Announcement update error:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

// Delete announcement (admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Announcement deletion error:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

export default router;
