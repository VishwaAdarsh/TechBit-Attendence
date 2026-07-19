const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'attendance.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database at:', dbPath);
    // Enable foreign key constraints
    db.run('PRAGMA foreign_keys = ON;', (err) => {
      if (err) console.error('Error enabling foreign keys:', err);
    });
  }
});

// Helper functions to use promises with sqlite3 callbacks
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Initialize and seed tables
const initializeDb = async () => {
  try {
    // USERS Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS USERS (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        member_id TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT CHECK(role IN ('ADMIN', 'MEMBER')) NOT NULL DEFAULT 'MEMBER',
        status TEXT CHECK(status IN ('ACTIVE', 'DEACTIVATED')) NOT NULL DEFAULT 'ACTIVE',
        class_year TEXT NOT NULL,
        committee_role TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // MEETINGS Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS MEETINGS (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        purpose TEXT,
        notes TEXT,
        created_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES USERS(id) ON DELETE RESTRICT
      )
    `);

    // ATTENDANCE Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS ATTENDANCE (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        meeting_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        status TEXT CHECK(status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')) NOT NULL,
        marked_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (meeting_id) REFERENCES MEETINGS(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
        FOREIGN KEY (marked_by) REFERENCES USERS(id) ON DELETE RESTRICT,
        UNIQUE(meeting_id, user_id)
      )
    `);

    console.log('Database tables verified/created successfully.');

    // Seed Admins
    await seedAdmins();

  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

const seedAdmins = async () => {
  const admins = [
    {
      name: 'IT Head Alpha',
      member_id: 'TB7-HEAD-01',
      email: 'alpha@techbit.com',
      password: 'AdminPassword70',
      role: 'ADMIN',
      class_year: 'Senior (Year 4)',
      committee_role: 'IT Coordinator'
    },
    {
      name: 'IT Head Beta',
      member_id: 'TB7-HEAD-02',
      email: 'beta@techbit.com',
      password: 'AdminPassword70',
      role: 'ADMIN',
      class_year: 'Senior (Year 4)',
      committee_role: 'Event Head'
    }
  ];

  for (const admin of admins) {
    const existing = await dbGet('SELECT * FROM USERS WHERE email = ? OR member_id = ?', [admin.email, admin.member_id]);
    if (!existing) {
      const passwordHash = bcrypt.hashSync(admin.password, 10);
      await dbRun(`
        INSERT INTO USERS (name, member_id, email, password_hash, role, status, class_year, committee_role)
        VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?, ?)
      `, [admin.name, admin.member_id, admin.email, passwordHash, admin.role, admin.class_year, admin.committee_role]);
      console.log(`Seeded admin account: ${admin.email}`);
    }
  }
};

module.exports = {
  db,
  dbRun,
  dbGet,
  dbAll,
  initializeDb
};
