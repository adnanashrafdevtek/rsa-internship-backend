const express = require('express');
const cors = require('cors');
const db = require('./db'); // promise-based pool
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

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

// POST /api/user
app.post('/api/user', async (req, res) => {
  const { firstName, lastName, emailAddress, address, role } = req.body;
  const sql = `INSERT INTO user (first_name, last_name, email, address, status, password, role) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  try {
    const [result] = await db.query(sql, [firstName, lastName, emailAddress, address, 0, "aasdsasdaa", role]);
    res.json({ id: result.insertId, firstName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users
app.get('/api/users', async (req, res) => {
  const query = `SELECT id, first_name, last_name, role FROM user WHERE status = 1`;
  const results = await runQuery(res, query);
  if (results) res.json(results);
});

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

// (Other calendar routes unchanged)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
