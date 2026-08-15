const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const DB_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DB_DIR, 'sail.db');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to open database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', DB_PATH);
  }
});

// Helper for promise-based db.run
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

// Helper for promise-based db.get
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Helper for promise-based db.all
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/**
 * Initialize Tables & Run Initial Seed
 */
async function initDatabase() {
  // 1. Users table
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Team table
  await run(`
    CREATE TABLE IF NOT EXISTS team (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      photo TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      email TEXT DEFAULT '',
      linkedin TEXT DEFAULT '',
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. Publications table
  await run(`
    CREATE TABLE IF NOT EXISTS publications (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      authors TEXT NOT NULL,
      venue TEXT NOT NULL,
      year INTEGER NOT NULL,
      link TEXT DEFAULT '',
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 4. Research table
  await run(`
    CREATE TABLE IF NOT EXISTS research (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 5. Projects table
  await run(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      details TEXT DEFAULT '',
      status TEXT DEFAULT '',
      tech_stack TEXT DEFAULT '',
      dates TEXT DEFAULT '',
      team TEXT DEFAULT '',
      repo_url TEXT DEFAULT '',
      demo_url TEXT DEFAULT '',
      pub_url TEXT DEFAULT '',
      image TEXT DEFAULT '',
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 6. Gallery table
  await run(`
    CREATE TABLE IF NOT EXISTS gallery (
      id TEXT PRIMARY KEY,
      image TEXT NOT NULL,
      caption TEXT DEFAULT '',
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 7. Settings table (single-row)
  await run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      lab_name TEXT,
      full_name TEXT,
      affiliation TEXT,
      tagline TEXT,
      mission TEXT,
      pi_name TEXT,
      pi_title TEXT,
      pi_photo TEXT,
      pi_bio TEXT,
      pi_email TEXT,
      contact_address TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 8. Contact Messages table
  await run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'unread',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default admin user if not exists
  const adminUser = await get(`SELECT * FROM users WHERE username = ? OR email = ?`, ['admin', process.env.ADMIN_EMAIL || 'sail@seecs.nust.edu.pk']);
  if (!adminUser) {
    const defaultPassword = process.env.ADMIN_PASSWORD || 'sail2026';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    await run(
      `INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
      ['u1', 'admin', process.env.ADMIN_EMAIL || 'sail@seecs.nust.edu.pk', passwordHash, 'admin']
    );
    console.log('Default admin user initialized (user: admin, pass: sail2026)');
  }

  // Seed initial content from JSON files if database tables are empty
  await seedFromJsonIfEmpty();
}

/**
 * Seed initial content from data/*.json if tables are empty
 */
async function seedFromJsonIfEmpty() {
  try {
    // Team
    const teamCount = await get(`SELECT COUNT(*) as count FROM team`);
    const teamJsonPath = path.join(DB_DIR, 'team.json');
    if (teamCount.count === 0 && fs.existsSync(teamJsonPath)) {
      const teamData = JSON.parse(fs.readFileSync(teamJsonPath, 'utf8'));
      for (let i = 0; i < teamData.length; i++) {
        const m = teamData[i];
        await run(
          `INSERT INTO team (id, name, role, photo, bio, email, linkedin, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [m.id || `t${i + 1}`, m.name, m.role, m.photo || '', m.bio || '', m.email || '', m.linkedin || '', i]
        );
      }
      console.log(`Seeded ${teamData.length} team members from JSON`);
    }

    // Publications
    const pubsCount = await get(`SELECT COUNT(*) as count FROM publications`);
    const pubsJsonPath = path.join(DB_DIR, 'publications.json');
    if (pubsCount.count === 0 && fs.existsSync(pubsJsonPath)) {
      const pubsData = JSON.parse(fs.readFileSync(pubsJsonPath, 'utf8'));
      for (let i = 0; i < pubsData.length; i++) {
        const p = pubsData[i];
        await run(
          `INSERT INTO publications (id, title, authors, venue, year, link, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [p.id || `p${i + 1}`, p.title, p.authors, p.venue, p.year || 2025, p.link || '', i]
        );
      }
      console.log(`Seeded ${pubsData.length} publications from JSON`);
    }

    // Research
    const resCount = await get(`SELECT COUNT(*) as count FROM research`);
    const resJsonPath = path.join(DB_DIR, 'research.json');
    if (resCount.count === 0 && fs.existsSync(resJsonPath)) {
      const resData = JSON.parse(fs.readFileSync(resJsonPath, 'utf8'));
      for (let i = 0; i < resData.length; i++) {
        const r = resData[i];
        await run(
          `INSERT INTO research (id, title, description, order_index) VALUES (?, ?, ?, ?)`,
          [r.id || `r${i + 1}`, r.title, r.description, i]
        );
      }
      console.log(`Seeded ${resData.length} research areas from JSON`);
    }

    // Projects
    const projCount = await get(`SELECT COUNT(*) as count FROM projects`);
    const projJsonPath = path.join(DB_DIR, 'projects.json');
    if (projCount.count === 0 && fs.existsSync(projJsonPath)) {
      const projData = JSON.parse(fs.readFileSync(projJsonPath, 'utf8'));
      for (let i = 0; i < projData.length; i++) {
        const p = projData[i];
        await run(
          `INSERT INTO projects (id, title, description, details, status, tech_stack, dates, team, repo_url, demo_url, pub_url, image, order_index)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            p.id || `p${i + 1}`,
            p.title,
            p.description,
            p.details || '',
            p.status || '',
            p.techStack || p.tech_stack || '',
            p.dates || '',
            p.team || '',
            p.repoUrl || p.repo_url || '',
            p.demoUrl || p.demo_url || '',
            p.pubUrl || p.pub_url || '',
            p.image || '',
            i
          ]
        );
      }
      console.log(`Seeded ${projData.length} projects from JSON`);
    }

    // Gallery
    const galleryCount = await get(`SELECT COUNT(*) as count FROM gallery`);
    const galleryJsonPath = path.join(DB_DIR, 'gallery.json');
    if (galleryCount.count === 0 && fs.existsSync(galleryJsonPath)) {
      const galleryData = JSON.parse(fs.readFileSync(galleryJsonPath, 'utf8'));
      for (let i = 0; i < galleryData.length; i++) {
        const g = galleryData[i];
        await run(
          `INSERT INTO gallery (id, image, caption, order_index) VALUES (?, ?, ?, ?)`,
          [g.id || `g${i + 1}`, g.image, g.caption || '', i]
        );
      }
      console.log(`Seeded ${galleryData.length} gallery items from JSON`);
    }

    // Settings
    const settingsCount = await get(`SELECT COUNT(*) as count FROM settings`);
    const settingsJsonPath = path.join(DB_DIR, 'settings.json');
    if (settingsCount.count === 0 && fs.existsSync(settingsJsonPath)) {
      const s = JSON.parse(fs.readFileSync(settingsJsonPath, 'utf8'));
      const pi = s.principalInvestigator || {};
      const contact = s.contact || {};
      await run(
        `INSERT INTO settings (id, lab_name, full_name, affiliation, tagline, mission, pi_name, pi_title, pi_photo, pi_bio, pi_email, contact_address, contact_email, contact_phone)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          s.labName || '',
          s.fullName || '',
          s.affiliation || '',
          s.tagline || '',
          s.mission || '',
          pi.name || '',
          pi.title || '',
          pi.photo || '',
          pi.bio || '',
          pi.email || '',
          contact.address || '',
          contact.email || '',
          contact.phone || ''
        ]
      );
      console.log('Seeded settings from JSON');
    }
  } catch (err) {
    console.error('Error during initial JSON seeding:', err);
  }
}

module.exports = {
  db,
  run,
  get,
  all,
  initDatabase,
};
