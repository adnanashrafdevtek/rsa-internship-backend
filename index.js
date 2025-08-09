import express from 'express';
import cors from 'cors';
import db from './db.js'; // promise-based pool
const app = express();
const PORT = 3000;
import { Composio } from "@composio/client";
import crypto from "crypto";
import fetch from "node-fetch";

app.use(cors());
app.use(express.json());


//TASKS
/*
1 - Upon adding  a new user, send unique activation link
2- when user clicks on activation link, let him set new password and activate account

*/
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
    await db.query("DELETE FROM user_activation WHERE token = ?", [token]);
    res.json({ success: true });
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
        user_id: "email", // replace with your connected Gmail
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

// Helper to run queries with async/await and send errors properly

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

// **NEW** GET /api/classes/:id/students — return students for a class
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

// ✅ NEW: Get students by grade level
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


// ✅ POST /api/classes/:classId/students — add student to class
// ... your existing requires, app setup, etc.

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

// ... your other routes and app.listen
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



// (Other calendar routes unchanged)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
// src/api/api.js
import axios from "axios";

/* =====================
   TEACHER APIs
===================== */
// Get teacher's classes & schedule
export const getTeacherSchedule = (teacherId) =>
  axios.get(`/api/teachers/${teacherId}/classes`);

/* =====================
   CLASSROOM APIs
===================== */
// Add a new classroom location
export const addClassroomLocation = (locationData) =>
  axios.post("/api/classrooms", locationData);

// Get all classroom locations
export const getClassroomLocations = () =>
  axios.get("/api/classrooms");

/* =====================
   CLASS APIs
===================== */
// Add a student to a class
export const addStudentToClass = (classId, studentId) =>
  axios.post(`/api/classes/${classId}/students`, { studentId });

/* =====================
   CALENDAR APIs
===================== */
// Add a calendar event (supports recurring)
export const addCalendarEvent = (eventData) =>
  axios.post("/api/calendar/events", eventData);

