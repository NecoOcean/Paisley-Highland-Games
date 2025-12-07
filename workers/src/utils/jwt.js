// JWT utilities using jose library (Cloudflare Workers compatible)
import * as jose from 'jose';

const JWT_EXPIRATION = '24h';

/**
 * Generate a JWT token
 * @param {object} payload - The payload to encode
 * @param {string} secret - The JWT secret
 * @returns {Promise<string>} - The JWT token
 */
export async function generateToken(payload, secret) {
  const secretKey = new TextEncoder().encode(secret);

  const token = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(secretKey);

  return token;
}

/**
 * Verify and decode a JWT token
 * @param {string} token - The JWT token
 * @param {string} secret - The JWT secret
 * @returns {Promise<object|null>} - The decoded payload or null if invalid
 */
export async function verifyToken(token, secret) {
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jose.jwtVerify(token, secretKey);
    return payload;
  } catch {
    return null;
  }
}
