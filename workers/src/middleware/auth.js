// Authentication middleware for Hono (Cloudflare Workers)
import { verifyToken } from '../utils/jwt.js';

/**
 * Authentication middleware - validates JWT token
 * Sets c.set('user', decodedUser) on success
 */
export async function authenticateToken(c, next) {
  const authHeader = c.req.header('authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return c.json({ error: 'Access token required' }, 401);
  }

  const decoded = await verifyToken(token, c.env.JWT_SECRET);

  if (!decoded) {
    return c.json({ error: 'Invalid or expired token' }, 403);
  }

  c.set('user', decoded);
  await next();
}

/**
 * Admin role middleware - requires admin role
 * Must be used after authenticateToken
 */
export async function requireAdmin(c, next) {
  const user = c.get('user');

  if (user.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }

  await next();
}

/**
 * Competitor role middleware - requires competitor or admin role
 * Must be used after authenticateToken
 */
export async function requireCompetitor(c, next) {
  const user = c.get('user');

  if (user.role !== 'competitor' && user.role !== 'admin') {
    return c.json({ error: 'Competitor access required' }, 403);
  }

  await next();
}
