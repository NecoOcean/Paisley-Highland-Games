// Seed data generator script for Cloudflare Workers
// Run with: node scripts/generate-seed.js

import { webcrypto } from 'crypto';

// Make Web Crypto API available in Node.js
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

const ITERATIONS = 100000;
const KEY_LENGTH = 64;

function generateSalt() {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password) {
  const salt = generateSalt();
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return `${salt}:${hashHex}`;
}

async function generateSeedSQL() {
  const adminPassword = await hashPassword('admin123');
  const userPassword = await hashPassword('user123');

  const sql = `-- D1 Database Seed Data for Paisley Highland Games
-- Auto-generated seed file with PBKDF2 password hashes
-- Generated: ${new Date().toISOString()}
--
-- Default credentials:
-- admin@paisleyhighlandgames.com: admin123
-- john@example.com: user123
-- mary@example.com: user123
-- visitor@example.com: user123

-- Clear existing data
DELETE FROM contact_messages;
DELETE FROM announcements;
DELETE FROM results;
DELETE FROM registrations;
DELETE FROM competitors;
DELETE FROM events;
DELETE FROM users;

-- Insert users
INSERT INTO users (email, password, name, role) VALUES
  ('admin@paisleyhighlandgames.com', '${adminPassword}', 'Admin User', 'admin'),
  ('john@example.com', '${userPassword}', 'John MacDonald', 'competitor'),
  ('mary@example.com', '${userPassword}', 'Mary Stewart', 'competitor'),
  ('visitor@example.com', '${userPassword}', 'James Wilson', 'user');

-- Insert events
INSERT INTO events (name, description, category, location, event_date, start_time, end_time, max_participants, registration_fee, image_url) VALUES
  ('Caber Toss', 'The iconic Scottish heavy event where competitors toss a large tapered pole called a caber. The goal is to flip it end over end so it lands pointing away from the thrower.', 'heavy', 'Main Arena', '2025-07-12', '10:00', '13:00', 30, 25.00, '/images/caber-toss.jpg'),
  ('Stone Put', 'Similar to shot put, competitors throw a heavy stone for distance. Two versions are contested: the Braemar Stone (thrown from standing) and the Open Stone (with a run-up).', 'heavy', 'Main Arena', '2025-07-12', '14:00', '16:00', 40, 20.00, '/images/stone-put.jpg'),
  ('Hammer Throw', 'Athletes throw a heavy metal ball attached to a wooden handle for distance. The Scottish hammer differs from the Olympic version in that the handle is made of wood or bamboo.', 'heavy', 'Main Arena', '2025-07-12', '16:30', '18:00', 30, 20.00, '/images/hammer-throw.jpg'),
  ('Highland Dancing Competition', 'Traditional Scottish dancing competition featuring the Highland Fling, Sword Dance, Seann Triubhas, and more. Categories for all ages and skill levels.', 'dancing', 'Dance Pavilion', '2025-07-12', '09:00', '17:00', 100, 15.00, '/images/highland-dancing.jpg'),
  ('Bagpipe Competition - Solo Piping', 'Individual piping competition showcasing traditional Scottish tunes. Competitors judged on technique, expression, and musicality.', 'piping', 'Piping Arena', '2025-07-13', '10:00', '15:00', 50, 20.00, '/images/bagpipe.jpg'),
  ('Pipe Band Competition', 'Pipe bands from across Scotland compete in this spectacular display of coordinated piping and drumming.', 'piping', 'Main Arena', '2025-07-13', '13:00', '18:00', 20, 100.00, '/images/pipe-band.jpg'),
  ('Tug of War', 'Teams of eight compete in this classic test of strength and teamwork. Multiple weight categories available.', 'athletics', 'Field B', '2025-07-13', '11:00', '14:00', 16, 50.00, '/images/tug-of-war.jpg'),
  ('Hill Race', 'A challenging 5K race through the scenic hills surrounding Paisley. Open to all fitness levels.', 'athletics', 'Gleniffer Braes', '2025-07-13', '08:00', '10:00', 200, 10.00, '/images/hill-race.jpg'),
  ('Weight Over Bar', 'Athletes throw a 56-pound weight over a raised bar using one hand. The bar height is progressively raised until only one competitor remains.', 'heavy', 'Main Arena', '2025-07-12', '11:00', '13:00', 25, 20.00, '/images/weight-over-bar.jpg'),
  ('Sheaf Toss', 'Using a pitchfork, competitors throw a burlap sack filled with straw over a raised bar. A test of both strength and technique.', 'heavy', 'Main Arena', '2025-07-13', '15:00', '17:00', 30, 15.00, '/images/sheaf-toss.jpg');

-- Insert competitors
INSERT INTO competitors (user_id, first_name, last_name, date_of_birth, gender, nationality, club, experience_level, emergency_contact_name, emergency_contact_phone) VALUES
  (2, 'John', 'MacDonald', '1990-05-15', 'male', 'Scottish', 'Glasgow Highland Club', 'professional', 'Sarah MacDonald', '+44 7700 900001'),
  (3, 'Mary', 'Stewart', '1995-08-22', 'female', 'Scottish', 'Edinburgh Dancers', 'advanced', 'Robert Stewart', '+44 7700 900002'),
  (NULL, 'Angus', 'McGregor', '1988-03-10', 'male', 'Scottish', 'Paisley Heavy Athletics', 'professional', 'Fiona McGregor', '+44 7700 900003'),
  (NULL, 'Eilidh', 'Campbell', '2000-11-30', 'female', 'Scottish', 'Highland Dance Academy', 'intermediate', 'Ian Campbell', '+44 7700 900004'),
  (NULL, 'Magnus', 'Eriksson', '1992-07-08', 'male', 'Swedish', 'Nordic Highland Society', 'advanced', 'Anna Eriksson', '+46 70 123 4567');

-- Insert registrations
INSERT INTO registrations (event_id, competitor_id, status, payment_status, notes) VALUES
  (1, 1, 'confirmed', 'paid', 'Returning champion'),
  (2, 1, 'confirmed', 'paid', NULL),
  (3, 1, 'confirmed', 'paid', NULL),
  (4, 2, 'confirmed', 'paid', 'Advanced category'),
  (1, 3, 'confirmed', 'paid', NULL),
  (2, 3, 'pending', 'unpaid', NULL),
  (4, 4, 'confirmed', 'paid', 'Intermediate category'),
  (1, 5, 'confirmed', 'paid', 'International competitor'),
  (9, 5, 'pending', 'unpaid', NULL);

-- Insert announcements
INSERT INTO announcements (title, content, author_id, is_published) VALUES
  ('Welcome to Paisley Highland Games 2025!', 'We are thrilled to announce that the Paisley Highland Games will return on July 12-13, 2025! Join us for two days of traditional Scottish competition, entertainment, and celebration. Registration is now open for all events.', 1, 1),
  ('Early Bird Registration Now Open', 'Take advantage of our early bird pricing! Register before May 1st and receive 20% off all event registration fees. This offer applies to all categories including heavy events, dancing, and piping competitions.', 1, 1),
  ('New Event: Hill Race Added', 'By popular demand, we have added a scenic 5K Hill Race to this year''s programme. The race will take runners through the beautiful Gleniffer Braes Country Park. Suitable for all fitness levels. Register now!', 1, 1),
  ('Volunteer Opportunities Available', 'We are looking for volunteers to help make the 2025 Paisley Highland Games a success. Volunteers receive free admission, a commemorative t-shirt, and meals. Various roles available including event marshalling, registration desk, and hospitality.', 1, 1);
`;

  return sql;
}

// Main
generateSeedSQL().then(sql => {
  console.log(sql);
}).catch(err => {
  console.error('Error generating seed SQL:', err);
  process.exit(1);
});
