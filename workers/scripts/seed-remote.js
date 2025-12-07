// Seed data script for Cloudflare D1
// Run with: node scripts/seed-remote.js

import { execSync } from 'child_process';
import { webcrypto } from 'crypto';

// Make Web Crypto API available in Node.js
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

const DB_NAME = 'paisley-highland-games-db';
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

function executeSQL(sql, isRemote = true) {
  const remoteFlag = isRemote ? '--remote' : '--local';
  const escapedSQL = sql.replace(/"/g, '\\"');
  const command = `wrangler d1 execute ${DB_NAME} ${remoteFlag} --command="${escapedSQL}"`;

  try {
    console.log(`Executing: ${sql.substring(0, 60)}...`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Failed to execute: ${sql.substring(0, 60)}...`);
    return false;
  }
}

async function seedDatabase(isRemote = true) {
  const target = isRemote ? 'remote' : 'local';
  console.log(`\n🌱 Seeding ${target} database...\n`);

  // Generate password hashes
  console.log('Generating password hashes...');
  const adminPassword = await hashPassword('admin123');
  const userPassword = await hashPassword('user123');
  console.log('Password hashes generated.\n');

  // Clear existing data
  console.log('Clearing existing data...');
  executeSQL('DELETE FROM contact_messages', isRemote);
  executeSQL('DELETE FROM announcements', isRemote);
  executeSQL('DELETE FROM results', isRemote);
  executeSQL('DELETE FROM registrations', isRemote);
  executeSQL('DELETE FROM competitors', isRemote);
  executeSQL('DELETE FROM events', isRemote);
  executeSQL('DELETE FROM users', isRemote);

  // Insert users
  console.log('\nInserting users...');
  executeSQL(`INSERT INTO users (email, password, name, role) VALUES ('admin@paisleyhighlandgames.com', '${adminPassword}', 'Admin User', 'admin')`, isRemote);
  executeSQL(`INSERT INTO users (email, password, name, role) VALUES ('john@example.com', '${userPassword}', 'John MacDonald', 'competitor')`, isRemote);
  executeSQL(`INSERT INTO users (email, password, name, role) VALUES ('mary@example.com', '${userPassword}', 'Mary Stewart', 'competitor')`, isRemote);
  executeSQL(`INSERT INTO users (email, password, name, role) VALUES ('visitor@example.com', '${userPassword}', 'James Wilson', 'user')`, isRemote);

  // Insert events
  console.log('\nInserting events...');
  const events = [
    `INSERT INTO events (name, description, category, location, event_date, start_time, end_time, max_participants, registration_fee, image_url) VALUES ('Caber Toss', 'The iconic Scottish heavy event where competitors toss a large tapered pole called a caber.', 'heavy', 'Main Arena', '2025-07-12', '10:00', '13:00', 30, 25.00, '/images/caber-toss.jpg')`,
    `INSERT INTO events (name, description, category, location, event_date, start_time, end_time, max_participants, registration_fee, image_url) VALUES ('Stone Put', 'Similar to shot put, competitors throw a heavy stone for distance.', 'heavy', 'Main Arena', '2025-07-12', '14:00', '16:00', 40, 20.00, '/images/stone-put.jpg')`,
    `INSERT INTO events (name, description, category, location, event_date, start_time, end_time, max_participants, registration_fee, image_url) VALUES ('Hammer Throw', 'Athletes throw a heavy metal ball attached to a wooden handle for distance.', 'heavy', 'Main Arena', '2025-07-12', '16:30', '18:00', 30, 20.00, '/images/hammer-throw.jpg')`,
    `INSERT INTO events (name, description, category, location, event_date, start_time, end_time, max_participants, registration_fee, image_url) VALUES ('Highland Dancing Competition', 'Traditional Scottish dancing competition featuring the Highland Fling, Sword Dance, and more.', 'dancing', 'Dance Pavilion', '2025-07-12', '09:00', '17:00', 100, 15.00, '/images/highland-dancing.jpg')`,
    `INSERT INTO events (name, description, category, location, event_date, start_time, end_time, max_participants, registration_fee, image_url) VALUES ('Bagpipe Competition - Solo Piping', 'Individual piping competition showcasing traditional Scottish tunes.', 'piping', 'Piping Arena', '2025-07-13', '10:00', '15:00', 50, 20.00, '/images/bagpipe.jpg')`,
    `INSERT INTO events (name, description, category, location, event_date, start_time, end_time, max_participants, registration_fee, image_url) VALUES ('Pipe Band Competition', 'Pipe bands from across Scotland compete in this spectacular display.', 'piping', 'Main Arena', '2025-07-13', '13:00', '18:00', 20, 100.00, '/images/pipe-band.jpg')`,
    `INSERT INTO events (name, description, category, location, event_date, start_time, end_time, max_participants, registration_fee, image_url) VALUES ('Tug of War', 'Teams of eight compete in this classic test of strength and teamwork.', 'athletics', 'Field B', '2025-07-13', '11:00', '14:00', 16, 50.00, '/images/tug-of-war.jpg')`,
    `INSERT INTO events (name, description, category, location, event_date, start_time, end_time, max_participants, registration_fee, image_url) VALUES ('Hill Race', 'A challenging 5K race through the scenic hills surrounding Paisley.', 'athletics', 'Gleniffer Braes', '2025-07-13', '08:00', '10:00', 200, 10.00, '/images/hill-race.jpg')`,
    `INSERT INTO events (name, description, category, location, event_date, start_time, end_time, max_participants, registration_fee, image_url) VALUES ('Weight Over Bar', 'Athletes throw a 56-pound weight over a raised bar using one hand.', 'heavy', 'Main Arena', '2025-07-12', '11:00', '13:00', 25, 20.00, '/images/weight-over-bar.jpg')`,
    `INSERT INTO events (name, description, category, location, event_date, start_time, end_time, max_participants, registration_fee, image_url) VALUES ('Sheaf Toss', 'Using a pitchfork, competitors throw a burlap sack filled with straw over a raised bar.', 'heavy', 'Main Arena', '2025-07-13', '15:00', '17:00', 30, 15.00, '/images/sheaf-toss.jpg')`,
  ];
  for (const sql of events) {
    executeSQL(sql, isRemote);
  }

  // Insert competitors
  console.log('\nInserting competitors...');
  executeSQL(`INSERT INTO competitors (user_id, first_name, last_name, date_of_birth, gender, nationality, club, experience_level, emergency_contact_name, emergency_contact_phone) VALUES (2, 'John', 'MacDonald', '1990-05-15', 'male', 'Scottish', 'Glasgow Highland Club', 'professional', 'Sarah MacDonald', '+44 7700 900001')`, isRemote);
  executeSQL(`INSERT INTO competitors (user_id, first_name, last_name, date_of_birth, gender, nationality, club, experience_level, emergency_contact_name, emergency_contact_phone) VALUES (3, 'Mary', 'Stewart', '1995-08-22', 'female', 'Scottish', 'Edinburgh Dancers', 'advanced', 'Robert Stewart', '+44 7700 900002')`, isRemote);
  executeSQL(`INSERT INTO competitors (user_id, first_name, last_name, date_of_birth, gender, nationality, club, experience_level, emergency_contact_name, emergency_contact_phone) VALUES (NULL, 'Angus', 'McGregor', '1988-03-10', 'male', 'Scottish', 'Paisley Heavy Athletics', 'professional', 'Fiona McGregor', '+44 7700 900003')`, isRemote);
  executeSQL(`INSERT INTO competitors (user_id, first_name, last_name, date_of_birth, gender, nationality, club, experience_level, emergency_contact_name, emergency_contact_phone) VALUES (NULL, 'Eilidh', 'Campbell', '2000-11-30', 'female', 'Scottish', 'Highland Dance Academy', 'intermediate', 'Ian Campbell', '+44 7700 900004')`, isRemote);
  executeSQL(`INSERT INTO competitors (user_id, first_name, last_name, date_of_birth, gender, nationality, club, experience_level, emergency_contact_name, emergency_contact_phone) VALUES (NULL, 'Magnus', 'Eriksson', '1992-07-08', 'male', 'Swedish', 'Nordic Highland Society', 'advanced', 'Anna Eriksson', '+46 70 123 4567')`, isRemote);

  // Insert registrations
  console.log('\nInserting registrations...');
  executeSQL(`INSERT INTO registrations (event_id, competitor_id, status, payment_status, notes) VALUES (1, 1, 'confirmed', 'paid', 'Returning champion')`, isRemote);
  executeSQL(`INSERT INTO registrations (event_id, competitor_id, status, payment_status, notes) VALUES (2, 1, 'confirmed', 'paid', NULL)`, isRemote);
  executeSQL(`INSERT INTO registrations (event_id, competitor_id, status, payment_status, notes) VALUES (3, 1, 'confirmed', 'paid', NULL)`, isRemote);
  executeSQL(`INSERT INTO registrations (event_id, competitor_id, status, payment_status, notes) VALUES (4, 2, 'confirmed', 'paid', 'Advanced category')`, isRemote);
  executeSQL(`INSERT INTO registrations (event_id, competitor_id, status, payment_status, notes) VALUES (1, 3, 'confirmed', 'paid', NULL)`, isRemote);
  executeSQL(`INSERT INTO registrations (event_id, competitor_id, status, payment_status, notes) VALUES (2, 3, 'pending', 'unpaid', NULL)`, isRemote);
  executeSQL(`INSERT INTO registrations (event_id, competitor_id, status, payment_status, notes) VALUES (4, 4, 'confirmed', 'paid', 'Intermediate category')`, isRemote);
  executeSQL(`INSERT INTO registrations (event_id, competitor_id, status, payment_status, notes) VALUES (1, 5, 'confirmed', 'paid', 'International competitor')`, isRemote);
  executeSQL(`INSERT INTO registrations (event_id, competitor_id, status, payment_status, notes) VALUES (9, 5, 'pending', 'unpaid', NULL)`, isRemote);

  // Insert announcements
  console.log('\nInserting announcements...');
  executeSQL(`INSERT INTO announcements (title, content, author_id, is_published) VALUES ('Welcome to Paisley Highland Games 2025!', 'We are thrilled to announce that the Paisley Highland Games will return on July 12-13, 2025! Join us for two days of traditional Scottish competition, entertainment, and celebration. Registration is now open for all events.', 1, 1)`, isRemote);
  executeSQL(`INSERT INTO announcements (title, content, author_id, is_published) VALUES ('Early Bird Registration Now Open', 'Take advantage of our early bird pricing! Register before May 1st and receive 20% off all event registration fees.', 1, 1)`, isRemote);
  executeSQL(`INSERT INTO announcements (title, content, author_id, is_published) VALUES ('New Event: Hill Race Added', 'By popular demand, we have added a scenic 5K Hill Race to this years programme.', 1, 1)`, isRemote);
  executeSQL(`INSERT INTO announcements (title, content, author_id, is_published) VALUES ('Volunteer Opportunities Available', 'We are looking for volunteers to help make the 2025 Paisley Highland Games a success.', 1, 1)`, isRemote);

  console.log(`\n✅ ${target} database seeded successfully!\n`);
  console.log('Demo accounts:');
  console.log('  admin@paisleyhighlandgames.com / admin123 (admin)');
  console.log('  john@example.com / user123 (competitor)');
  console.log('  mary@example.com / user123 (competitor)');
  console.log('  visitor@example.com / user123 (user)\n');
}

// Parse command line arguments
const args = process.argv.slice(2);
const isLocal = args.includes('--local');

seedDatabase(!isLocal);
