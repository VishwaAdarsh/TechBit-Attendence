const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString || 'postgresql://postgres:postgres@localhost:5432/techbit_attendance',
  ssl: connectionString ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

// Helper functions for PostgreSQL queries
const dbGet = async (sql, params = []) => {
  const res = await pool.query(sql, params);
  return res.rows[0] || null;
};

const dbAll = async (sql, params = []) => {
  const res = await pool.query(sql, params);
  return res.rows;
};

const dbRun = async (sql, params = []) => {
  const res = await pool.query(sql, params);
  return {
    id: res.rows && res.rows[0] && res.rows[0].id !== undefined ? res.rows[0].id : null,
    changes: res.rowCount,
    rowCount: res.rowCount
  };
};

// Initialize and seed PostgreSQL tables
const initializeDb = async () => {
  try {
    // USERS Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS USERS (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        member_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) CHECK(role IN ('ADMIN', 'MEMBER')) NOT NULL DEFAULT 'MEMBER',
        status VARCHAR(20) CHECK(status IN ('ACTIVE', 'DEACTIVATED')) NOT NULL DEFAULT 'ACTIVE',
        class_year VARCHAR(100) NOT NULL,
        committee_role VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // MEETINGS Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS MEETINGS (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        date VARCHAR(100) NOT NULL,
        time VARCHAR(100) NOT NULL,
        purpose TEXT,
        notes TEXT,
        created_by INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES USERS(id) ON DELETE RESTRICT
      )
    `);

    // ATTENDANCE Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS ATTENDANCE (
        id SERIAL PRIMARY KEY,
        meeting_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        status VARCHAR(20) CHECK(status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')) NOT NULL,
        marked_by INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (meeting_id) REFERENCES MEETINGS(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
        FOREIGN KEY (marked_by) REFERENCES USERS(id) ON DELETE RESTRICT,
        UNIQUE(meeting_id, user_id)
      )
    `);

    console.log('Database tables verified/created successfully in PostgreSQL.');

    // Seed Admins
    await seedAdmins();

  } catch (error) {
    console.error('Error initializing PostgreSQL database:', error);
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
    const existing = await dbGet('SELECT id FROM USERS WHERE email = $1 OR member_id = $2', [admin.email, admin.member_id]);
    if (!existing) {
      const passwordHash = bcrypt.hashSync(admin.password, 10);
      await dbRun(`
        INSERT INTO USERS (name, member_id, email, password_hash, role, status, class_year, committee_role)
        VALUES ($1, $2, $3, $4, $5, 'ACTIVE', $6, $7)
      `, [admin.name, admin.member_id, admin.email, passwordHash, admin.role, admin.class_year, admin.committee_role]);
      console.log(`Seeded admin account: ${admin.email}`);
    }
  }
};

module.exports = {
  db: pool,
  pool,
  dbRun,
  dbGet,
  dbAll,
  initializeDb
};
