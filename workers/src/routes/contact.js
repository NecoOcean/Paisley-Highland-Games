// Contact routes for Cloudflare Workers (Hono)
import { Hono } from 'hono';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const contact = new Hono();

// Get unread count (admin only) - must be before /:id
contact.get('/stats/unread', authenticateToken, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;

    const result = await db.prepare('SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0').first();
    return c.json({ unread_count: result.count });
  } catch (error) {
    console.error('Unread count error:', error);
    return c.json({ error: 'Failed to get unread count' }, 500);
  }
});

// Submit contact message (public)
contact.post('/', async (c) => {
  try {
    const db = c.env.DB;
    const { name, email, subject, message } = await c.req.json();

    if (!name || !email || !message) {
      return c.json({ error: 'Name, email, and message are required' }, 400);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: 'Invalid email address' }, 400);
    }

    const result = await db.prepare(`
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES (?, ?, ?, ?)
    `).bind(name, email, subject, message).run();

    return c.json({
      message: 'Your message has been sent successfully. We will get back to you soon.',
      id: result.meta.last_row_id
    }, 201);
  } catch (error) {
    console.error('Contact message error:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

// Get all contact messages (admin only)
contact.get('/', authenticateToken, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const { is_read } = c.req.query();

    let query = 'SELECT * FROM contact_messages';
    const params = [];

    if (is_read !== undefined) {
      query += ' WHERE is_read = ?';
      params.push(is_read === 'true' ? 1 : 0);
    }

    query += ' ORDER BY created_at DESC';

    const stmt = db.prepare(query);
    const boundStmt = params.length > 0 ? stmt.bind(...params) : stmt;
    const { results } = await boundStmt.all();

    return c.json(results);
  } catch (error) {
    console.error('Messages fetch error:', error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

// Get single message (admin only)
contact.get('/:id', authenticateToken, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const messageId = c.req.param('id');

    const message = await db.prepare('SELECT * FROM contact_messages WHERE id = ?').bind(messageId).first();

    if (!message) {
      return c.json({ error: 'Message not found' }, 404);
    }

    // Mark as read
    if (!message.is_read) {
      await db.prepare('UPDATE contact_messages SET is_read = 1 WHERE id = ?').bind(messageId).run();
    }

    return c.json({ ...message, is_read: 1 });
  } catch (error) {
    console.error('Message fetch error:', error);
    return c.json({ error: 'Failed to fetch message' }, 500);
  }
});

// Mark message as read/unread (admin only)
contact.patch('/:id/read', authenticateToken, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const messageId = c.req.param('id');
    const { is_read } = await c.req.json();

    const existing = await db.prepare('SELECT * FROM contact_messages WHERE id = ?').bind(messageId).first();
    if (!existing) {
      return c.json({ error: 'Message not found' }, 404);
    }

    await db.prepare('UPDATE contact_messages SET is_read = ? WHERE id = ?')
      .bind(is_read ? 1 : 0, messageId).run();

    return c.json({ message: 'Message status updated' });
  } catch (error) {
    console.error('Message update error:', error);
    return c.json({ error: 'Failed to update message' }, 500);
  }
});

// Delete message (admin only)
contact.delete('/:id', authenticateToken, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const messageId = c.req.param('id');

    const existing = await db.prepare('SELECT * FROM contact_messages WHERE id = ?').bind(messageId).first();
    if (!existing) {
      return c.json({ error: 'Message not found' }, 404);
    }

    await db.prepare('DELETE FROM contact_messages WHERE id = ?').bind(messageId).run();
    return c.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Message deletion error:', error);
    return c.json({ error: 'Failed to delete message' }, 500);
  }
});

export default contact;
