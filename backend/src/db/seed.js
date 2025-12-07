import db from './database.js';
import bcrypt from 'bcryptjs';

// Clear existing data
db.exec(`
  DELETE FROM contact_messages;
  DELETE FROM announcements;
  DELETE FROM results;
  DELETE FROM registrations;
  DELETE FROM competitors;
  DELETE FROM events;
  DELETE FROM users;
`);

// Reset auto-increment counters
db.exec(`
  DELETE FROM sqlite_sequence;
`);

console.log('Seeding database...');

// Create admin user
const adminPassword = bcrypt.hashSync('admin123', 10);
const userPassword = bcrypt.hashSync('user123', 10);

const insertUser = db.prepare(`
  INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)
`);

insertUser.run('admin@paisleyhighlandgames.com', adminPassword, 'Admin User', 'admin');
insertUser.run('john@example.com', userPassword, 'John MacDonald', 'competitor');
insertUser.run('mary@example.com', userPassword, 'Mary Stewart', 'competitor');
insertUser.run('visitor@example.com', userPassword, 'James Wilson', 'user');

console.log('Users created');

// Create events
const insertEvent = db.prepare(`
  INSERT INTO events (name, description, category, location, event_date, start_time, end_time, max_participants, registration_fee, image_url)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const events = [
  {
    name: 'Caber Toss',
    description: 'The iconic Scottish heavy event where competitors toss a large tapered pole called a caber. The goal is to flip it end over end so it lands pointing away from the thrower.',
    category: 'heavy',
    location: 'Main Arena',
    event_date: '2025-07-12',
    start_time: '10:00',
    end_time: '13:00',
    max_participants: 30,
    registration_fee: 25.00,
    image_url: '/images/caber-toss.jpg'
  },
  {
    name: 'Stone Put',
    description: 'Similar to shot put, competitors throw a heavy stone for distance. Two versions are contested: the Braemar Stone (thrown from standing) and the Open Stone (with a run-up).',
    category: 'heavy',
    location: 'Main Arena',
    event_date: '2025-07-12',
    start_time: '14:00',
    end_time: '16:00',
    max_participants: 40,
    registration_fee: 20.00,
    image_url: '/images/stone-put.jpg'
  },
  {
    name: 'Hammer Throw',
    description: 'Athletes throw a heavy metal ball attached to a wooden handle for distance. The Scottish hammer differs from the Olympic version in that the handle is made of wood or bamboo.',
    category: 'heavy',
    location: 'Main Arena',
    event_date: '2025-07-12',
    start_time: '16:30',
    end_time: '18:00',
    max_participants: 30,
    registration_fee: 20.00,
    image_url: '/images/hammer-throw.jpg'
  },
  {
    name: 'Highland Dancing Competition',
    description: 'Traditional Scottish dancing competition featuring the Highland Fling, Sword Dance, Seann Triubhas, and more. Categories for all ages and skill levels.',
    category: 'dancing',
    location: 'Dance Pavilion',
    event_date: '2025-07-12',
    start_time: '09:00',
    end_time: '17:00',
    max_participants: 100,
    registration_fee: 15.00,
    image_url: '/images/highland-dancing.jpg'
  },
  {
    name: 'Bagpipe Competition - Solo Piping',
    description: 'Individual piping competition showcasing traditional Scottish tunes. Competitors judged on technique, expression, and musicality.',
    category: 'piping',
    location: 'Piping Arena',
    event_date: '2025-07-13',
    start_time: '10:00',
    end_time: '15:00',
    max_participants: 50,
    registration_fee: 20.00,
    image_url: '/images/bagpipe.jpg'
  },
  {
    name: 'Pipe Band Competition',
    description: 'Pipe bands from across Scotland compete in this spectacular display of coordinated piping and drumming.',
    category: 'piping',
    location: 'Main Arena',
    event_date: '2025-07-13',
    start_time: '13:00',
    end_time: '18:00',
    max_participants: 20,
    registration_fee: 100.00,
    image_url: '/images/pipe-band.jpg'
  },
  {
    name: 'Tug of War',
    description: 'Teams of eight compete in this classic test of strength and teamwork. Multiple weight categories available.',
    category: 'athletics',
    location: 'Field B',
    event_date: '2025-07-13',
    start_time: '11:00',
    end_time: '14:00',
    max_participants: 16,
    registration_fee: 50.00,
    image_url: '/images/tug-of-war.jpg'
  },
  {
    name: 'Hill Race',
    description: 'A challenging 5K race through the scenic hills surrounding Paisley. Open to all fitness levels.',
    category: 'athletics',
    location: 'Gleniffer Braes',
    event_date: '2025-07-13',
    start_time: '08:00',
    end_time: '10:00',
    max_participants: 200,
    registration_fee: 10.00,
    image_url: '/images/hill-race.jpg'
  },
  {
    name: 'Weight Over Bar',
    description: 'Athletes throw a 56-pound weight over a raised bar using one hand. The bar height is progressively raised until only one competitor remains.',
    category: 'heavy',
    location: 'Main Arena',
    event_date: '2025-07-12',
    start_time: '11:00',
    end_time: '13:00',
    max_participants: 25,
    registration_fee: 20.00,
    image_url: '/images/weight-over-bar.jpg'
  },
  {
    name: 'Sheaf Toss',
    description: 'Using a pitchfork, competitors throw a burlap sack filled with straw over a raised bar. A test of both strength and technique.',
    category: 'heavy',
    location: 'Main Arena',
    event_date: '2025-07-13',
    start_time: '15:00',
    end_time: '17:00',
    max_participants: 30,
    registration_fee: 15.00,
    image_url: '/images/sheaf-toss.jpg'
  }
];

for (const event of events) {
  insertEvent.run(
    event.name,
    event.description,
    event.category,
    event.location,
    event.event_date,
    event.start_time,
    event.end_time,
    event.max_participants,
    event.registration_fee,
    event.image_url
  );
}

console.log('Events created');

// Create competitors
const insertCompetitor = db.prepare(`
  INSERT INTO competitors (user_id, first_name, last_name, date_of_birth, gender, nationality, club, experience_level, emergency_contact_name, emergency_contact_phone)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const competitors = [
  { user_id: 2, first_name: 'John', last_name: 'MacDonald', dob: '1990-05-15', gender: 'male', nationality: 'Scottish', club: 'Glasgow Highland Club', level: 'professional', ec_name: 'Sarah MacDonald', ec_phone: '+44 7700 900001' },
  { user_id: 3, first_name: 'Mary', last_name: 'Stewart', dob: '1995-08-22', gender: 'female', nationality: 'Scottish', club: 'Edinburgh Dancers', level: 'advanced', ec_name: 'Robert Stewart', ec_phone: '+44 7700 900002' },
  { user_id: null, first_name: 'Angus', last_name: 'McGregor', dob: '1988-03-10', gender: 'male', nationality: 'Scottish', club: 'Paisley Heavy Athletics', level: 'professional', ec_name: 'Fiona McGregor', ec_phone: '+44 7700 900003' },
  { user_id: null, first_name: 'Eilidh', last_name: 'Campbell', dob: '2000-11-30', gender: 'female', nationality: 'Scottish', club: 'Highland Dance Academy', level: 'intermediate', ec_name: 'Ian Campbell', ec_phone: '+44 7700 900004' },
  { user_id: null, first_name: 'Magnus', last_name: 'Eriksson', dob: '1992-07-08', gender: 'male', nationality: 'Swedish', club: 'Nordic Highland Society', level: 'advanced', ec_name: 'Anna Eriksson', ec_phone: '+46 70 123 4567' },
];

for (const c of competitors) {
  insertCompetitor.run(c.user_id, c.first_name, c.last_name, c.dob, c.gender, c.nationality, c.club, c.level, c.ec_name, c.ec_phone);
}

console.log('Competitors created');

// Create registrations
const insertRegistration = db.prepare(`
  INSERT INTO registrations (event_id, competitor_id, status, payment_status, notes)
  VALUES (?, ?, ?, ?, ?)
`);

const registrations = [
  { event_id: 1, competitor_id: 1, status: 'confirmed', payment_status: 'paid', notes: 'Returning champion' },
  { event_id: 2, competitor_id: 1, status: 'confirmed', payment_status: 'paid', notes: null },
  { event_id: 3, competitor_id: 1, status: 'confirmed', payment_status: 'paid', notes: null },
  { event_id: 4, competitor_id: 2, status: 'confirmed', payment_status: 'paid', notes: 'Advanced category' },
  { event_id: 1, competitor_id: 3, status: 'confirmed', payment_status: 'paid', notes: null },
  { event_id: 2, competitor_id: 3, status: 'pending', payment_status: 'unpaid', notes: null },
  { event_id: 4, competitor_id: 4, status: 'confirmed', payment_status: 'paid', notes: 'Intermediate category' },
  { event_id: 1, competitor_id: 5, status: 'confirmed', payment_status: 'paid', notes: 'International competitor' },
  { event_id: 9, competitor_id: 5, status: 'pending', payment_status: 'unpaid', notes: null },
];

for (const r of registrations) {
  insertRegistration.run(r.event_id, r.competitor_id, r.status, r.payment_status, r.notes);
}

console.log('Registrations created');

// Create announcements
const insertAnnouncement = db.prepare(`
  INSERT INTO announcements (title, content, author_id, is_published)
  VALUES (?, ?, ?, ?)
`);

const announcements = [
  {
    title: 'Welcome to Paisley Highland Games 2025!',
    content: 'We are thrilled to announce that the Paisley Highland Games will return on July 12-13, 2025! Join us for two days of traditional Scottish competition, entertainment, and celebration. Registration is now open for all events.',
    author_id: 1,
    is_published: 1
  },
  {
    title: 'Early Bird Registration Now Open',
    content: 'Take advantage of our early bird pricing! Register before May 1st and receive 20% off all event registration fees. This offer applies to all categories including heavy events, dancing, and piping competitions.',
    author_id: 1,
    is_published: 1
  },
  {
    title: 'New Event: Hill Race Added',
    content: 'By popular demand, we have added a scenic 5K Hill Race to this year\'s programme. The race will take runners through the beautiful Gleniffer Braes Country Park. Suitable for all fitness levels. Register now!',
    author_id: 1,
    is_published: 1
  },
  {
    title: 'Volunteer Opportunities Available',
    content: 'We are looking for volunteers to help make the 2025 Paisley Highland Games a success. Volunteers receive free admission, a commemorative t-shirt, and meals. Various roles available including event marshalling, registration desk, and hospitality.',
    author_id: 1,
    is_published: 1
  }
];

for (const a of announcements) {
  insertAnnouncement.run(a.title, a.content, a.author_id, a.is_published);
}

console.log('Announcements created');

console.log('Database seeded successfully!');
