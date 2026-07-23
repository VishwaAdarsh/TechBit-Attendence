require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { initializeDb, dbAll, dbGet, dbRun } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'techbit_default_secret_key_2026';
const HEAD_ACCESS_CODE = process.env.HEAD_ACCESS_CODE;

app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// AUTHENTICATION MIDDLEWARES
// ----------------------------------------------------

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
};

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admin access only' });
    }

    // Verify role in the database to prevent token manipulation
    const dbUser = await dbGet('SELECT role, status FROM USERS WHERE id = $1', [req.user.id]);
    if (!dbUser || dbUser.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Valid Admin database role required' });
    }

    if (dbUser.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Forbidden: Admin account is deactivated' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Server authorization check failed' });
  }
};

// ----------------------------------------------------
// AUTHENTICATION ENDPOINTS
// ----------------------------------------------------

// Registration (Public for Members, Secured with Access Code for Admins)
app.post('/api/auth/register', async (req, res) => {
  const { name, member_id, email, password, class_year, committee_role, role, accessCode } = req.body;

  if (!name || !member_id || !email || !password || !class_year || !committee_role) {
    return res.status(400).json({ error: 'All registration fields are required' });
  }

  // Determine role based on request and Access Code verification
  let assignedRole = 'MEMBER';
  if (role === 'ADMIN') {
    if (!accessCode || accessCode !== HEAD_ACCESS_CODE) {
      return res.status(401).json({ error: 'Invalid Head Access Code. Admin registration denied.' });
    }
    assignedRole = 'ADMIN';
  }

  try {
    // Check if email or member ID exists
    const existingEmail = await dbGet('SELECT id FROM USERS WHERE email = $1', [email]);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const existingMemberId = await dbGet('SELECT id FROM USERS WHERE member_id = $1', [member_id]);
    if (existingMemberId) {
      return res.status(400).json({ error: 'Member ID already registered' });
    }

    const status = 'ACTIVE';
    const passwordHash = bcrypt.hashSync(password, 10);

    const result = await dbRun(`
      INSERT INTO USERS (name, member_id, email, password_hash, role, status, class_year, committee_role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [name, member_id, email, passwordHash, assignedRole, status, class_year, committee_role]);

    const insertedId = result.id;

    const token = jwt.sign(
      { id: insertedId, name, member_id, email, role: assignedRole },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: insertedId, name, member_id, email, role: assignedRole, class_year, committee_role }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// Member Login
app.post('/api/auth/login/member', async (req, res) => {
  const { emailOrId, password } = req.body;

  if (!emailOrId || !password) {
    return res.status(400).json({ error: 'Email/ID and Password are required' });
  }

  try {
    const user = await dbGet(
      'SELECT * FROM USERS WHERE (email = $1 OR member_id = $2)',
      [emailOrId, emailOrId]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid Email/ID or Password' });
    }

    if (user.role !== 'MEMBER') {
      return res.status(403).json({ error: 'Invalid login flow. Please use the IT Head login screen.' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Your account is deactivated. Please contact the IT Head.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid Email/ID or Password' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, member_id: user.member_id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        member_id: user.member_id,
        email: user.email,
        role: user.role,
        class_year: user.class_year,
        committee_role: user.committee_role
      }
    });

  } catch (error) {
    console.error('Member login error:', error);
    res.status(500).json({ error: 'Internal server error during member login' });
  }
});

// IT Head/Admin Login
app.post('/api/auth/login/admin', async (req, res) => {
  const { emailOrId, password, accessCode } = req.body;

  if (!emailOrId || !password || !accessCode) {
    return res.status(400).json({ error: 'All fields (Email/ID, Password, and Access Code) are required' });
  }

  try {
    // 1. Verify Special Head Access Code from backend environment
    if (accessCode !== HEAD_ACCESS_CODE) {
      return res.status(401).json({ error: 'Invalid Head Access Code. Admin access denied.' });
    }

    // 2. Look up the admin user
    const user = await dbGet(
      'SELECT * FROM USERS WHERE (email = $1 OR member_id = $2)',
      [emailOrId, emailOrId]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid Admin Email/ID or Password' });
    }

    // 3. Verify they actually have the ADMIN role in the database
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied: Predefined Admin account required' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Admin account is deactivated' });
    }

    // 4. Verify Password
    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid Admin Email/ID or Password' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, member_id: user.member_id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        member_id: user.member_id,
        email: user.email,
        role: user.role,
        class_year: user.class_year,
        committee_role: user.committee_role
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error during Admin login' });
  }
});

// ----------------------------------------------------
// USER/PROFILE ROUTES
// ----------------------------------------------------

// Get personal profile & attendance details
app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet(
      'SELECT id, name, member_id, email, role, status, class_year, committee_role FROM USERS WHERE id = $1',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'MEMBER') {
      // Fetch personal attendance records
      const attendance = await dbAll(`
        SELECT a.id, a.status, a.created_at, a.updated_at, m.id as meeting_id, m.title, m.date, m.time
        FROM ATTENDANCE a
        JOIN MEETINGS m ON a.meeting_id = m.id
        WHERE a.user_id = $1
        ORDER BY m.date DESC, m.time DESC
      `, [user.id]);

      // Calculate attendance statistics dynamically
      const totalMeetingsRow = await dbGet('SELECT COUNT(*) as count FROM MEETINGS');
      const totalMeetings = totalMeetingsRow ? parseInt(totalMeetingsRow.count, 10) : 0;

      let present = 0;
      let absent = 0;
      let late = 0;
      let excused = 0;

      attendance.forEach(record => {
        if (record.status === 'PRESENT') present++;
        else if (record.status === 'ABSENT') absent++;
        else if (record.status === 'LATE') late++;
        else if (record.status === 'EXCUSED') excused++;
      });

      const eligibleMeetings = totalMeetings - excused;
      let percentage = 'N/A';
      if (eligibleMeetings > 0) {
        percentage = (((present + late) / eligibleMeetings) * 100).toFixed(1);
      }

      return res.json({
        user,
        stats: {
          totalMeetings,
          present,
          absent,
          late,
          excused,
          percentage
        },
        attendance
      });
    }

    // For admins, return user object directly
    res.json({ user });

  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ error: 'Internal server error fetching user data' });
  }
});

// ----------------------------------------------------
// ADMIN-ONLY MANAGEMENT ROUTES
// ----------------------------------------------------

// Get overall statistics summary for admin dashboard
app.get('/api/admin/summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalMembersRow = await dbGet("SELECT COUNT(*) as count FROM USERS WHERE role = 'MEMBER'");
    const totalMeetingsRow = await dbGet("SELECT COUNT(*) as count FROM MEETINGS");

    const totalMembers = totalMembersRow ? parseInt(totalMembersRow.count, 10) : 0;
    const totalMeetings = totalMeetingsRow ? parseInt(totalMeetingsRow.count, 10) : 0;

    // Latest meeting
    const latestMeeting = await dbGet("SELECT id, title, date FROM MEETINGS ORDER BY date DESC, time DESC LIMIT 1");
    let latestAttendance = { present: 0, absent: 0, late: 0, excused: 0 };

    if (latestMeeting) {
      const records = await dbAll("SELECT status, COUNT(*) as count FROM ATTENDANCE WHERE meeting_id = $1 GROUP BY status", [latestMeeting.id]);
      records.forEach(r => {
        latestAttendance[r.status.toLowerCase()] = parseInt(r.count, 10);
      });
    }

    // Average attendance rate
    // Defined as: overall (PRESENT + LATE) / (TOTAL ATTENDANCE RECORDS - EXCUSED) * 100
    const overallStats = await dbGet(`
      SELECT 
        SUM(case when status = 'PRESENT' then 1 else 0 end) as present,
        SUM(case when status = 'LATE' then 1 else 0 end) as late,
        SUM(case when status = 'EXCUSED' then 1 else 0 end) as excused,
        COUNT(*) as total
      FROM ATTENDANCE
    `);

    let averagePercentage = 'N/A';
    if (overallStats && parseInt(overallStats.total, 10) > 0) {
      const presentCount = parseInt(overallStats.present || 0, 10);
      const lateCount = parseInt(overallStats.late || 0, 10);
      const excusedCount = parseInt(overallStats.excused || 0, 10);
      const totalCount = parseInt(overallStats.total || 0, 10);

      const presentAndLate = presentCount + lateCount;
      const eligible = totalCount - excusedCount;
      if (eligible > 0) {
        averagePercentage = ((presentAndLate / eligible) * 100).toFixed(1);
      }
    }

    res.json({
      totalMembers,
      totalMeetings,
      latestMeeting: latestMeeting ? { id: latestMeeting.id, title: latestMeeting.title, date: latestMeeting.date, stats: latestAttendance } : null,
      averagePercentage
    });

  } catch (error) {
    console.error('Summary stats error:', error);
    res.status(500).json({ error: 'Internal server error calculating summary statistics' });
  }
});

// View all members (with search capability)
app.get('/api/admin/members', authenticateToken, requireAdmin, async (req, res) => {
  const { q } = req.query;
  try {
    let query = "SELECT id, name, member_id, email, role, status, class_year, committee_role, created_at FROM USERS WHERE role = 'MEMBER'";
    let params = [];

    if (q) {
      query += " AND (name ILIKE $1 OR member_id ILIKE $2 OR email ILIKE $3 OR committee_role ILIKE $4)";
      const searchPattern = `%${q}%`;
      params = [searchPattern, searchPattern, searchPattern, searchPattern];
    }

    query += " ORDER BY name ASC";
    const members = await dbAll(query, params);
    res.json(members);

  } catch (error) {
    console.error('List members error:', error);
    res.status(500).json({ error: 'Internal server error listing members' });
  }
});

// Edit member information
app.put('/api/admin/members/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, member_id, email, class_year, committee_role } = req.body;

  if (!name || !member_id || !email || !class_year || !committee_role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Validate uniqueness of email and member_id for other users
    const existingEmail = await dbGet('SELECT id FROM USERS WHERE email = $1 AND id != $2', [email, id]);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email is already taken by another user' });
    }

    const existingMemberId = await dbGet('SELECT id FROM USERS WHERE member_id = $1 AND id != $2', [member_id, id]);
    if (existingMemberId) {
      return res.status(400).json({ error: 'Member ID is already taken by another user' });
    }

    await dbRun(`
      UPDATE USERS
      SET name = $1, member_id = $2, email = $3, class_year = $4, committee_role = $5
      WHERE id = $6 AND role = 'MEMBER'
    `, [name, member_id, email, class_year, committee_role, id]);

    res.json({ message: 'Member updated successfully' });

  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ error: 'Internal server error updating member' });
  }
});

// Toggle member status (Active / Deactivated)
app.put('/api/admin/members/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || (status !== 'ACTIVE' && status !== 'DEACTIVATED')) {
    return res.status(400).json({ error: "Invalid status value. Must be 'ACTIVE' or 'DEACTIVATED'" });
  }

  try {
    await dbRun(`
      UPDATE USERS
      SET status = $1
      WHERE id = $2 AND role = 'MEMBER'
    `, [status, id]);

    res.json({ message: `Member status updated to ${status}` });

  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ error: 'Internal server error changing member status' });
  }
});

// Create meeting
app.post('/api/admin/meetings', authenticateToken, requireAdmin, async (req, res) => {
  const { title, date, time, purpose, notes } = req.body;

  if (!title || !date || !time) {
    return res.status(400).json({ error: 'Title, Date, and Time are required' });
  }

  try {
    const result = await dbRun(`
      INSERT INTO MEETINGS (title, date, time, purpose, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [title, date, time, purpose, notes, req.user.id]);

    const insertedId = result.id;

    res.status(201).json({
      message: 'Meeting created successfully',
      meeting: { id: insertedId, title, date, time, purpose, notes }
    });

  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ error: 'Internal server error creating meeting' });
  }
});

// Get all meetings (history)
app.get('/api/admin/meetings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const meetings = await dbAll(`
      SELECT m.id, m.title, m.date, m.time, m.purpose, m.notes, u.name as creator_name
      FROM MEETINGS m
      JOIN USERS u ON m.created_by = u.id
      ORDER BY m.date DESC, m.time DESC
    `);
    res.json(meetings);

  } catch (error) {
    console.error('List meetings error:', error);
    res.status(500).json({ error: 'Internal server error listing meetings' });
  }
});

// Get attendance list for a specific meeting (returns all active members and their marked status)
app.get('/api/admin/meetings/:id/attendance', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    // Verify meeting exists first
    const meeting = await dbGet('SELECT * FROM MEETINGS WHERE id = $1', [id]);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Return active members, LEFT JOINing current attendance record if marked
    const attendanceRecords = await dbAll(`
      SELECT 
        u.id as user_id, 
        u.name, 
        u.member_id, 
        u.committee_role, 
        u.class_year, 
        a.status
      FROM USERS u
      LEFT JOIN ATTENDANCE a ON u.id = a.user_id AND a.meeting_id = $1
      WHERE u.role = 'MEMBER' AND u.status = 'ACTIVE'
      ORDER BY u.name ASC
    `, [id]);

    res.json({
      meeting,
      members: attendanceRecords
    });

  } catch (error) {
    console.error('Fetch meeting attendance error:', error);
    res.status(500).json({ error: 'Internal server error fetching attendance list' });
  }
});

// Mark/save attendance for a meeting (bulk save/update)
app.post('/api/admin/meetings/:id/attendance', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params; // meeting_id
  const { records } = req.body; // array of { user_id, status }

  if (!records || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Attendance records array is required' });
  }

  try {
    const meeting = await dbGet('SELECT * FROM MEETINGS WHERE id = $1', [id]);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    for (const record of records) {
      const { user_id, status } = record;

      if (!user_id || !status) {
        continue;
      }

      if (!['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].includes(status)) {
        return res.status(400).json({ error: `Invalid status code: ${status} for user ID ${user_id}` });
      }

      // Upsert into ATTENDANCE in PostgreSQL
      await dbRun(`
        INSERT INTO ATTENDANCE (meeting_id, user_id, status, marked_by, updated_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT(meeting_id, user_id) 
        DO UPDATE SET 
          status = EXCLUDED.status,
          marked_by = EXCLUDED.marked_by,
          updated_at = CURRENT_TIMESTAMP
      `, [id, user_id, status, req.user.id]);
    }

    res.json({ message: 'Attendance records saved successfully' });

  } catch (error) {
    console.error('Save attendance error:', error);
    res.status(500).json({ error: 'Internal server error saving attendance' });
  }
});

// Start the server
const startServer = async () => {
  try {
    await initializeDb();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

startServer();
