const express = require('express');
const cors = require('cors');
const db = require('./db'); // promise-based pool
const app = express();
const PORT = 3000;
const { Composio } = require("@composio/client");
const crypto = require("crypto");
const fetch = require("node-fetch");

app.use(cors());
app.use(express.json());

//TASKS
/*
1 - Upon adding  a new user, send unique activation link
2- when user clicks on activation link, let him set new password and activate account
*/

// GET teacher availability
app.get("/api/teacher-availability/:teacherId", async (req, res) => {
  const teacherId = parseInt(req.params.teacherId);
  if (!teacherId) return res.status(400).json({ error: "Invalid teacher ID" });

  try {
    const [results] = await db.query(
      `SELECT 
        id,
        teacher_id,
        day_of_week,
        start_time,
        end_time,
        valid_from,
        valid_to,
        created_at
      FROM teacher_availability
      WHERE teacher_id = ?`,
      [teacherId]
    );
      //testing
    // Map to frontend-friendly events
    const events = results.map(r => ({
      id: r.id,
      teacher_id: r.teacher_id,
      title: "Available",
      day_of_week: r.day_of_week,
      start_time: r.start_time,
      end_time: r.end_time,
      valid_from: r.valid_from,
      valid_to: r.valid_to,
    }));

    res.json(events);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// POST save/update teacher availability
app.post("/api/teacher-availability", async (req, res) => {
  const { teacher_id, events } = req.body;
  if (!teacher_id || !events || !events.length) {
    return res.status(400).json({ error: "Missing teacher_id or events" });
  }

  try {
    // Clear old slots for this teacher
    await db.query("DELETE FROM teacher_availability WHERE teacher_id = ?", [teacher_id]);

    for (const e of events) {
      const startDate = new Date(e.start);
      const endDate = new Date(e.end);

      const dayOfWeek = startDate.getDay(); // 0 = Sunday, 6 = Saturday

      const startTime = startDate.toTimeString().split(" ")[0]; // "HH:MM:SS"
      const endTime = endDate.toTimeString().split(" ")[0];

      await db.query(
        `INSERT INTO teacher_availability 
         (teacher_id, day_of_week, start_time, end_time, valid_from, valid_to) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          teacher_id,
          dayOfWeek,
          startTime,
          endTime,
          startDate.toISOString().slice(0, 10), // YYYY-MM-DD
          endDate.toISOString().slice(0, 10),   // YYYY-MM-DD
        ]
      );
    }

    res.json({ success: true, message: "Availability saved!" });
  } catch (err) {
    console.error("❌ DB error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Activation route
app.post("/api/activate", async (req, res) => {
  const { token, password } = req.body;
  try {
    const [results] = await db.query(
      "SELECT user_id, expires_at FROM user_activation WHERE token = ?",
      [token]
    );
    if (results.length === 0) return res.status(400).json({ error: "Invalid token" });

    const { user_id, expires_at } = results[0];
    if (new Date() > expires_at) {
      return res.status(400).json({ error: "Token expired" });
    }

    await db.query(
      "UPDATE user SET password = ?, status = 1 WHERE id = ?",
      [password, user_id]
    );

    // Get the user's role after activation
    const [userResults] = await db.query(
      "SELECT role FROM user WHERE id = ?",
      [user_id]
    );

    await db.query("DELETE FROM user_activation WHERE token = ?", [token]);

    res.json({ success: true, user_id, role: userResults[0].role.toLowerCase() });
  } catch (err) {
    res.status(500).json({ error: err.message || "DB error" });
  }
});

// LOGIN ROUTE (no bcrypt, plain text check)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required" });
  }
  try {
    const [results] = await db.query("SELECT * FROM user WHERE email = ?", [email]);
    if (results.length === 0) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }
    const user = results[0];
    if (user.status !== 1) {
      return res.status(403).json({ success: false, error: "Account not activated" });
    }
    if (user.password !== password) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }
    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Login DB Error:", err);
    return res.status(500).json({ success: false, error: "Database error" });
  }
});

app.post("/api/user", async (req, res) => {
  const { firstName, lastName, emailAddress, address, role } = req.body;
  const dummyPassword = "temporary"; // hash later for security
  try {
    const [result] = await db.query(
      "INSERT INTO user (first_name, last_name, email, address, role, password, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [firstName, lastName, emailAddress, address, role, dummyPassword, 0]
    );
    const userId = result.insertId;
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await db.query(
      "INSERT INTO user_activation (user_id, token, expires_at) VALUES (?, ?, ?)",
      [userId, token, expiresAt]
    );
    const activationLink = `http://localhost:3001/activation-form?token=${token}`;
    fetch("https://backend.composio.dev/api/v3/tools/execute/GMAIL_SEND_EMAIL", {
      method: "POST",
      headers: {
        "x-api-key": process.env.COMPOSIO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: `email ${emailAddress} with the subject "Activate your account" and the body "Hello ${firstName},\n\nPlease activate your account by clicking this link:\n${activationLink}"`,
        user_id: "pg-test-b310aa29-6b6e-4c6f-b225-dbad2e20f602", // replace with your connected Gmail
      }),
    })
      .then((r) => r.json())
      .then((emailResult) => {
        res.json({
          success: true,
          firstName,
          emailSent: emailResult.success || !emailResult.error,
        });
      })
      .catch((err3) => {
        console.error("❌ Email Error:", err3);
        res.json({ success: true, firstName, emailSent: false });
      });
  } catch (err) {
    console.error("❌ DB Insert Error:", err);
    return res.status(500).json({ success: false, error: "Database insert failed" });
  }
});

// Users route (all active users)
app.get('/api/users', async (req, res) => {
  const query = `
    SELECT id, first_name, last_name, role 
    FROM user 
    WHERE status = 1
  `;
  try {
    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Helper for queries
async function runQuery(res, query, params = []) {
  try {
    const [results] = await db.query(query, params);
    return results;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'DB error' });
    return null;
  }
}

// GET /api/students
app.get('/api/students', async (req, res) => {
  const query = `SELECT id, first_name, last_name, role FROM user WHERE role = 'student' AND status = 1`;
  const results = await runQuery(res, query);
  if (results) res.json(results);
});

// GET /api/teachers
app.get('/api/teachers', async (req, res) => {
  const query = `SELECT id, first_name, last_name, role FROM user WHERE role = 'teacher' AND status = 1`;
  const results = await runQuery(res, query);
  if (results) res.json(results);
});

// GET /api/classes
app.get('/api/classes', async (req, res) => {
  const query = `
    SELECT 
      c.id,
      c.name,
      c.grade_level,
      c.start_time,
      c.end_time,
      c.recurring_days,
      u.first_name AS teacher_first_name,
      u.last_name AS teacher_last_name
    FROM class c
    LEFT JOIN user u ON c.teacher_id = u.id
  `;
  const results = await runQuery(res, query);
  if (!results) return;
  const formatted = results.map(row => ({
    id: row.id,
    name: row.name,
    grade_level: row.grade_level,
    start_time: row.start_time,
    end_time: row.end_time,
    recurring_days: row.recurring_days,
    teacher_first_name: row.teacher_first_name,
    teacher_last_name: row.teacher_last_name,
  }));
  res.json(formatted);
});

// POST /api/classes
app.post('/api/classes', async (req, res) => {
  const { name, grade_level, teacher_id, start_time, end_time, recurring_days } = req.body;
  if (!name || !grade_level || !teacher_id) {
    return res.status(400).json({ error: "Name, grade_level, and teacher_id are required" });
  }
  const sql = `INSERT INTO class (name, grade_level, teacher_id, start_time, end_time, recurring_days) VALUES (?, ?, ?, ?, ?, ?)`;
  try {
    const [result] = await db.query(sql, [name, grade_level, teacher_id, start_time || null, end_time || null, recurring_days || null]);
    res.json({ id: result.insertId, name, grade_level, teacher_id, start_time, end_time, recurring_days });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/classes/:id — return single class info
app.get('/api/classes/:id', async (req, res) => {
  const classId = parseInt(req.params.id);
  if (!classId) return res.status(400).json({ error: 'Invalid class ID' });

  const query = `
    SELECT 
      c.id,
      c.name,
      c.grade_level,
      c.start_time,
      c.end_time,
      c.recurring_days,
      u.first_name AS teacher_first_name,
      u.last_name AS teacher_last_name
    FROM class c
    LEFT JOIN user u ON c.teacher_id = u.id
    WHERE c.id = ?
  `;

  try {
    const [results] = await db.query(query, [classId]);
    if (results.length === 0) return res.status(404).json({ error: 'Class not found' });
    res.json(results[0]);
  } catch (err) {
    console.error('Error in GET /api/classes/:id:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/classes/:id/students — return students for a class
app.get('/api/classes/:id/students', async (req, res) => {
  const classId = parseInt(req.params.id);
  if (!classId) return res.status(400).json({ error: 'Invalid class ID' });

  const query = `
    SELECT u.id, u.first_name, u.last_name, u.email, u.grade_level
    FROM user u
    INNER JOIN student_class sc ON sc.user_id = u.id
    WHERE sc.class_id = ?
  `;

  try {
    const [results] = await db.query(query, [classId]);
    res.json(results);
  } catch (err) {
    console.error('Error in GET /api/classes/:id/students:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/classes/:id — update class info
app.put('/api/classes/:id', async (req, res) => {
  const classId = parseInt(req.params.id);
  const { name, grade_level, teacher_id, start_time, end_time, recurring_days } = req.body;

  const query = `
    UPDATE class
    SET name = ?, grade_level = ?, teacher_id = ?, start_time = ?, end_time = ?, recurring_days = ?
    WHERE id = ?
  `;

  try {
    const [result] = await db.query(query, [name, grade_level, teacher_id, start_time, end_time, recurring_days, classId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Class not found' });
    res.json({ message: 'Class updated successfully' });
  } catch (err) {
    console.error('Error in PUT /api/classes/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/classes/:id
app.delete('/api/classes/:id', async (req, res) => {
  const classId = parseInt(req.params.id);
  if (!classId) return res.status(400).json({ error: "Invalid class ID" });

  try {
    const [result] = await db.query('DELETE FROM class WHERE id = ?', [classId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Class not found" });
    res.json({ message: `Class ${classId} deleted successfully` });
  } catch (err) {
    console.error('Error in DELETE /api/classes/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get students by grade level
app.get('/api/students/grade/:gradeLevel', async (req, res) => {
  const gradeLevel = req.params.gradeLevel;
  try {
    const [students] = await db.query(
      'SELECT id, first_name, last_name, grade_level FROM user WHERE role = "student" AND grade_level = ? AND status = 1',
      [gradeLevel]
    );
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch students by grade' });
  }
});

// GET /api/students/:studentId/classes — Get all classes for a specific student
app.get('/api/students/:studentId/classes', async (req, res) => {
  const studentId = parseInt(req.params.studentId);
  
  if (!studentId || isNaN(studentId)) {
    return res.status(400).json({ error: 'Invalid student ID' });
  }

  try {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.name AS subject,
        c.grade_level,
        c.start_time,
        c.end_time,
        c.recurring_days,
        c.teacher_id,
        CONCAT(u.first_name, ' ', u.last_name) AS teacher_name,
        u.first_name AS teacher_first_name,
        u.last_name AS teacher_last_name
      FROM student_class sc
      INNER JOIN class c ON sc.class_id = c.id
      LEFT JOIN user u ON c.teacher_id = u.id
      WHERE sc.user_id = ?
      ORDER BY c.name
    `;
    
    const [classes] = await db.query(query, [studentId]);
    
    // Transform recurring_days from string to array of numbers
    const formattedClasses = classes.map(cls => {
      let recurringDaysArray = [];
      if (cls.recurring_days) {
        // Parse recurring_days string (e.g., "Mon,Wed,Fri" or "Monday,Wednesday,Friday")
        const dayMap = {
          'mon': 0, 'monday': 0,
          'tue': 1, 'tuesday': 1,
          'wed': 2, 'wednesday': 2,
          'thu': 3, 'thursday': 3,
          'fri': 4, 'friday': 4,
          'sat': 5, 'saturday': 5,
          'sun': 6, 'sunday': 6
        };
        
        const days = cls.recurring_days.toLowerCase().split(',').map(d => d.trim());
        recurringDaysArray = days
          .map(day => dayMap[day])
          .filter(num => num !== undefined);
      }
      
      // Format time from datetime to HH:MM:SS
      let startTime = null;
      let endTime = null;
      
      if (cls.start_time) {
        const startDate = new Date(cls.start_time);
        startTime = startDate.toTimeString().split(' ')[0];
      }
      
      if (cls.end_time) {
        const endDate = new Date(cls.end_time);
        endTime = endDate.toTimeString().split(' ')[0];
      }
      
      return {
        id: cls.id,
        name: cls.name,
        subject: cls.subject,
        grade_level: cls.grade_level,
        start_time: startTime,
        end_time: endTime,
        recurring_days: recurringDaysArray,
        teacher_id: cls.teacher_id,
        teacher_name: cls.teacher_name,
        teacher_first_name: cls.teacher_first_name,
        teacher_last_name: cls.teacher_last_name,
        room: null
      };
    });
    
    res.json(formattedClasses);
  } catch (error) {
    console.error('Error fetching student classes:', error);
    res.status(500).json({ error: 'Failed to fetch student classes', details: error.message });
  }
});

// GET /api/teachers/:teacherId/classes — Get classes for a specific teacher
app.get('/api/teachers/:teacherId/classes', async (req, res) => {
  const teacherId = parseInt(req.params.teacherId);
  if (!teacherId) return res.status(400).json({ error: 'Invalid teacher ID' });

  const query = `
    SELECT 
      c.id,
      c.name,
      c.grade_level,
      c.start_time,
      c.end_time,
      c.recurring_days,
      c.teacher_id,
      u.first_name AS teacher_first_name,
      u.last_name AS teacher_last_name
    FROM class c
    LEFT JOIN user u ON c.teacher_id = u.id
    WHERE c.teacher_id = ?
  `;

  try {
    const [results] = await db.query(query, [teacherId]);
    const formatted = results.map(row => ({
      id: row.id,
      name: row.name,
      grade_level: row.grade_level,
      start_time: row.start_time,
      end_time: row.end_time,
      recurring_days: row.recurring_days,
      teacher_id: row.teacher_id,
      teacher_first_name: row.teacher_first_name,
      teacher_last_name: row.teacher_last_name,
    }));
    res.json(formatted);
  } catch (err) {
    console.error('Error in GET /api/teachers/:teacherId/classes:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/calendar — return all calendar events for master schedule
app.get('/api/calendar', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT idcalendar AS id, event_title AS title, start_time, end_time, class_id, user_id, description, room, grade, subject FROM calendar'
    );
    res.json(rows);
  } catch (err) {
    console.error("Calendar Fetch Error:", err);
    res.status(500).json({ error: 'DB error fetching calendar events' });
  }
});

// POST /api/classes/:classId/students — add student to class
app.post('/api/classes/:classId/students', async (req, res) => {
  const classId = parseInt(req.params.classId);
  const { student_id } = req.body;

  if (!classId || !student_id) {
    return res.status(400).json({ error: "Class ID and student ID are required" });
  }

  try {
    const [existing] = await db.query(
      'SELECT * FROM student_class WHERE class_id = ? AND user_id = ?',
      [classId, student_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "One or more of your students is already in the class" });
    }

    await db.query(
      'INSERT INTO student_class (class_id, user_id) VALUES (?, ?)',
      [classId, student_id]
    );

    res.status(201).json({ message: "Student added to class" });
  } catch (err) {
    console.error("Error adding student to class:", err);
    res.status(500).json({ error: "Failed to add student to class" });
  }
});

// DELETE /api/classes/:classId/students/:studentId — remove student from class
app.delete('/api/classes/:classId/students/:studentId', async (req, res) => {
  const classId = parseInt(req.params.classId);
  const studentId = parseInt(req.params.studentId);

  if (!classId || !studentId) {
    return res.status(400).json({ error: 'Class ID and student ID are required' });
  }

  try {
    const [result] = await db.query(
      'DELETE FROM student_class WHERE class_id = ? AND user_id = ?',
      [classId, studentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found in this class' });
    }

    res.json({ message: 'Student removed from class' });
  } catch (err) {
    console.error('Error removing student from class:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all teacher availabilities (for scheduling)
app.get("/api/teacher-availabilities", async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT 
        ta.id,
        ta.teacher_id,
        u.first_name AS teacher_first_name,
        u.last_name AS teacher_last_name,
        ta.day_of_week,
        ta.start_time,
        ta.end_time,
        ta.valid_from,
        ta.valid_to,
        ta.created_at
      FROM teacher_availability ta
      LEFT JOIN user u ON ta.teacher_id = u.id`
    );
    res.json(results);
  } catch (err) {
    console.error("Error fetching teacher availabilities:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get all availabilities for a specific teacher (for scheduling)
app.get("/api/teacher-availabilities/:teacherId", async (req, res) => {
  const teacherId = parseInt(req.params.teacherId);
  if (!teacherId) return res.status(400).json({ error: "Invalid teacher ID" });

  try {
    const [results] = await db.query(
      `SELECT 
        ta.id,
        ta.teacher_id,
        u.first_name AS teacher_first_name,
        u.last_name AS teacher_last_name,
        ta.day_of_week,
        ta.start_time,
        ta.end_time,
        ta.valid_from,
        ta.valid_to,
        ta.created_at
      FROM teacher_availability ta
      LEFT JOIN user u ON ta.teacher_id = u.id
      WHERE ta.teacher_id = ?`,
      [teacherId]
    );
    res.json(results);
  } catch (err) {
    console.error("Error fetching teacher availabilities:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ========== SCHEDULE API ENDPOINTS ==========

// POST /api/schedules — Save a new schedule
app.post('/api/schedules', async (req, res) => {
  try {
    const { 
      start_time, 
      end_time, 
      class_id, 
      event_title, 
      user_id, 
      description,
      room,
      grade,
      subject
    } = req.body;

    const query = `
      INSERT INTO calendar (start_time, end_time, class_id, event_title, user_id, description, room, grade, subject)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(query, [
      start_time, 
      end_time, 
      class_id, 
      event_title, 
      user_id, 
      description,
      room,
      grade,
      subject
    ]);
    
    res.json({ 
      success: true, 
      id: result.insertId,
      message: 'Schedule saved successfully' 
    });
  } catch (error) {
    console.error('Error saving schedule:', error);
    res.status(500).json({ success: false, message: 'Failed to save schedule' });
  }
});

// GET /api/schedules — Get all schedules
app.get('/api/schedules', async (req, res) => {
  try {
    const query = `
      SELECT c.*, u.first_name, u.last_name 
      FROM calendar c
      LEFT JOIN user u ON c.user_id = u.id
      ORDER BY c.start_time
    `;
    
    const [schedules] = await db.query(query);
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schedules' });
  }
});

// GET /api/teachers/:teacherId/schedules — Get teacher-specific schedules
app.get('/api/teachers/:teacherId/schedules', async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    const query = `
      SELECT c.*, u.first_name, u.last_name 
      FROM calendar c
      LEFT JOIN user u ON c.user_id = u.id
      WHERE c.user_id = ?
      ORDER BY c.start_time
    `;
    
    const [schedules] = await db.query(query, [teacherId]);
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching teacher schedules:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch teacher schedules' });
  }
});

// PUT /api/schedules/:id — Update a schedule
app.put('/api/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      start_time, 
      end_time, 
      class_id, 
      event_title, 
      user_id, 
      description,
      room,
      grade,
      subject
    } = req.body;

    const query = `
      UPDATE calendar 
      SET start_time = ?, end_time = ?, class_id = ?, event_title = ?, user_id = ?, description = ?, room = ?, grade = ?, subject = ?
      WHERE idcalendar = ?
    `;
    
    await db.query(query, [
      start_time, 
      end_time, 
      class_id, 
      event_title, 
      user_id, 
      description,
      room,
      grade,
      subject,
      id
    ]);
    
    res.json({ success: true, message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ success: false, message: 'Failed to update schedule' });
  }
});

// DELETE /api/schedules/:id — Delete a schedule
app.delete('/api/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM calendar WHERE idcalendar = ?';
    await db.query(query, [id]);
    
    res.json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ success: false, message: 'Failed to delete schedule' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});