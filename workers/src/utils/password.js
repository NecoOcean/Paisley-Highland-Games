// Password utilities using Web Crypto API (Cloudflare Workers compatible)
// Uses PBKDF2 for password hashing

const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const ALGORITHM = 'PBKDF2';
const HASH = 'SHA-256';

/**
 * Generate a random salt
 */
function generateSalt() {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a password using PBKDF2
 * @param {string} password - The password to hash
 * @returns {Promise<string>} - The hashed password in format: salt:hash
 */
export async function hashPassword(password) {
  const salt = generateSalt();
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    ALGORITHM,
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: ALGORITHM,
      salt: encoder.encode(salt),
      iterations: ITERATIONS,
      hash: HASH
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return `${salt}:${hashHex}`;
}

/**
 * Verify a password against a hash
 * @param {string} password - The password to verify
 * @param {string} storedHash - The stored hash in format: salt:hash
 * @returns {Promise<boolean>} - Whether the password is valid
 */
export async function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(':');

  if (!salt || !hash) {
    return false;
  }

  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    ALGORITHM,
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: ALGORITHM,
      salt: encoder.encode(salt),
      iterations: ITERATIONS,
      hash: HASH
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return computedHash === hash;
}
