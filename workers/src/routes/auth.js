// Auth routes for Cloudflare Workers (Hono)
import { Hono } from 'hono';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { authenticateToken } from '../middleware/auth.js';

const auth = new Hono();

// Register new user
auth.post('/register', async (c) => {
  try {
    const { email, password, name, role = 'user' } = await c.req.json();
    const db = c.env.DB;

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    // Check if user already exists
    const existingUser = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    if (existingUser) {
      return c.json({ error: 'Email already registered' }, 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert user
    const userRole = role === 'competitor' ? 'competitor' : 'user';
    const result = await db.prepare(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)'
    ).bind(email, hashedPassword, name, userRole).run();

    const userId = result.meta.last_row_id;

    const token = await generateToken(
      { id: userId, email, name, role: userRole },
      c.env.JWT_SECRET
    );

    return c.json({
      message: 'User registered successfully',
      user: { id: userId, email, name, role: userRole },
      token
    }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// Login
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    const db = c.env.DB;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Find user
    const user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Verify password
    const validPassword = await verifyPassword(password, user.password);
    if (!validPassword) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Generate token
    const token = await generateToken(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      c.env.JWT_SECRET
    );

    return c.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Get current user profile
auth.get('/me', authenticateToken, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('user').id;

    const user = await db.prepare(
      'SELECT id, email, name, role, created_at FROM users WHERE id = ?'
    ).bind(userId).first();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Update user profile
auth.put('/me', authenticateToken, async (c) => {
  try {
    const db = c.env.DB;
    const userId = c.get('user').id;
    const { name, currentPassword, newPassword } = await c.req.json();

    if (newPassword) {
      if (!currentPassword) {
        return c.json({ error: 'Current password required to change password' }, 400);
      }

      const user = await db.prepare('SELECT password FROM users WHERE id = ?').bind(userId).first();
      const validPassword = await verifyPassword(currentPassword, user.password);
      if (!validPassword) {
        return c.json({ error: 'Current password is incorrect' }, 401);
      }

      const hashedPassword = await hashPassword(newPassword);
      await db.prepare(
        "UPDATE users SET password = ?, updated_at = datetime('now') WHERE id = ?"
      ).bind(hashedPassword, userId).run();
    }

    if (name) {
      await db.prepare(
        "UPDATE users SET name = ?, updated_at = datetime('now') WHERE id = ?"
      ).bind(name, userId).run();
    }

    const updatedUser = await db.prepare(
      'SELECT id, email, name, role FROM users WHERE id = ?'
    ).bind(userId).first();

    return c.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

export default auth;
