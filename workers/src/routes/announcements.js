// Announcements routes for Cloudflare Workers (Hono)
import { Hono } from 'hono';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const announcements = new Hono();

// Get all published announcements (public)
announcements.get('/', async (c) => {
  try {
    const db = c.env.DB;
    const { limit } = c.req.query();

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

    const { results } = await db.prepare(query).all();
    return c.json(results);
  } catch (error) {
    console.error('Announcements fetch error:', error);
    return c.json({ error: 'Failed to fetch announcements' }, 500);
  }
});

// Get all announcements including drafts (admin only) - must be before /:id
announcements.get('/admin/all', authenticateToken, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;

    const { results } = await db.prepare(`
      SELECT a.*, u.name as author_name
      FROM announcements a
      LEFT JOIN users u ON a.author_id = u.id
      ORDER BY a.created_at DESC
    `).all();

    return c.json(results);
  } catch (error) {
    console.error('Admin announcements fetch error:', error);
    return c.json({ error: 'Failed to fetch announcements' }, 500);
  }
});

// Get single announcement (public)
announcements.get('/:id', async (c) => {
  try {
    const db = c.env.DB;
    const announcementId = c.req.param('id');

    const announcement = await db.prepare(`
      SELECT a.*, u.name as author_name
      FROM announcements a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.id = ? AND a.is_published = 1
    `).bind(announcementId).first();

    if (!announcement) {
      return c.json({ error: 'Announcement not found' }, 404);
    }

    return c.json(announcement);
  } catch (error) {
    console.error('Announcement fetch error:', error);
    return c.json({ error: 'Failed to fetch announcement' }, 500);
  }
});

// Create announcement (admin only)
announcements.post('/', authenticateToken, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('user').id;
    const { title, content, is_published = true } = await c.req.json();

    if (!title || !content) {
      return c.json({ error: 'Title and content are required' }, 400);
    }

    const publishedAt = is_published ? "datetime('now')" : 'NULL';

    const result = await db.prepare(`
      INSERT INTO announcements (title, content, author_id, is_published, published_at)
      VALUES (?, ?, ?, ?, ${is_published ? "datetime('now')" : 'NULL'})
    `).bind(title, content, userId, is_published ? 1 : 0).run();

    const announcement = await db.prepare('SELECT * FROM announcements WHERE id = ?')
      .bind(result.meta.last_row_id).first();

    return c.json(announcement, 201);
  } catch (error) {
    console.error('Announcement creation error:', error);
    return c.json({ error: 'Failed to create announcement' }, 500);
  }
});

// Update announcement (admin only)
announcements.put('/:id', authenticateToken, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const announcementId = c.req.param('id');
    const { title, content, is_published } = await c.req.json();

    const existing = await db.prepare('SELECT * FROM announcements WHERE id = ?').bind(announcementId).first();
    if (!existing) {
      return c.json({ error: 'Announcement not found' }, 404);
    }

    // If publishing for first time, set published_at
    let publishedAt = existing.published_at;
    if (is_published && !existing.is_published) {
      publishedAt = new Date().toISOString();
    }

    const isPublishedValue = is_published !== undefined ? (is_published ? 1 : 0) : null;

    await db.prepare(`
      UPDATE announcements SET
        title = COALESCE(?, title),
        content = COALESCE(?, content),
        is_published = COALESCE(?, is_published),
        published_at = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(title, content, isPublishedValue, publishedAt, announcementId).run();

    const announcement = await db.prepare('SELECT * FROM announcements WHERE id = ?')
      .bind(announcementId).first();

    return c.json(announcement);
  } catch (error) {
    console.error('Announcement update error:', error);
    return c.json({ error: 'Failed to update announcement' }, 500);
  }
});

// Delete announcement (admin only)
announcements.delete('/:id', authenticateToken, requireAdmin, async (c) => {
  try {
    const db = c.env.DB;
    const announcementId = c.req.param('id');

    const existing = await db.prepare('SELECT * FROM announcements WHERE id = ?').bind(announcementId).first();
    if (!existing) {
      return c.json({ error: 'Announcement not found' }, 404);
    }

    await db.prepare('DELETE FROM announcements WHERE id = ?').bind(announcementId).run();
    return c.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Announcement deletion error:', error);
    return c.json({ error: 'Failed to delete announcement' }, 500);
  }
});

export default announcements;
