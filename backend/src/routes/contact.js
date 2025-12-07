import express from 'express';
import db from '../db/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Submit contact message (public)
router.post('/', (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const result = db.prepare(`
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES (?, ?, ?, ?)
    `).run(name, email, subject, message);

    res.status(201).json({
      message: 'Your message has been sent successfully. We will get back to you soon.',
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Contact message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get all contact messages (admin only)
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { is_read } = req.query;

    let query = 'SELECT * FROM contact_messages';
    const params = [];

    if (is_read !== undefined) {
      query += ' WHERE is_read = ?';
      params.push(is_read === 'true' ? 1 : 0);
    }

    query += ' ORDER BY created_at DESC';

    const messages = db.prepare(query).all(...params);
    res.json(messages);
  } catch (error) {
    console.error('Messages fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get single message (admin only)
router.get('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const message = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(req.params.id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Mark as read
    if (!message.is_read) {
      db.prepare('UPDATE contact_messages SET is_read = 1 WHERE id = ?').run(req.params.id);
    }

    res.json({ ...message, is_read: 1 });
  } catch (error) {
    console.error('Message fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch message' });
  }
});

// Mark message as read/unread (admin only)
router.patch('/:id/read', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { is_read } = req.body;

    const existing = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Message not found' });
    }

    db.prepare('UPDATE contact_messages SET is_read = ? WHERE id = ?').run(is_read ? 1 : 0, req.params.id);

    res.json({ message: 'Message status updated' });
  } catch (error) {
    console.error('Message update error:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// Delete message (admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Message not found' });
    }

    db.prepare('DELETE FROM contact_messages WHERE id = ?').run(req.params.id);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Message deletion error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Get unread count (admin only)
router.get('/stats/unread', authenticateToken, requireAdmin, (req, res) => {
  try {
    const result = db.prepare('SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0').get();
    res.json({ unread_count: result.count });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

export default router;
