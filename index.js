const express = require('express');
const cors = require('cors');
const db = require('./db'); // promise-based pool
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Helper to run queries with async/await and send errors properly
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

// GET /myCalendar
app.get('/myCalendar', async (req, res) => {
  const query = `SELECT idcalendar, start_time, end_time, class_id, event_title FROM calendar`;
  const results = await runQuery(res, query);
  if (!results) return;
  const formatted = results.map(event => ({
    id: event.idcalendar,
    start_time: event.start_time,
    end_time: event.end_time,
    class_id: event.class_id,
    title: event.event_title || "No Title",
  }));
  res.json(formatted);
});

// POST /calendar
app.post('/calendar', async (req, res) => {
  const { start_time, end_time, class_id, event_title } = req.body;
  if (!start_time || !end_time || !class_id || !event_title) {
    return res.status(400).json({ error: "start_time, end_time, class_id, and event_title are required" });
  }
  const sql = `INSERT INTO calendar (start_time, end_time, class_id, event_title) VALUES (?, ?, ?, ?)`;
  try {
    const [result] = await db.query(sql, [start_time, end_time, class_id, event_title]);
    res.json({ idcalendar: result.insertId, start_time, end_time, class_id, event_title });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /calendar/:id
app.put('/calendar/:id', async (req, res) => {
  const eventId = parseInt(req.params.id);
  const { start_time, end_time, class_id, event_title } = req.body;

  if (!start_time && !end_time && !class_id && !event_title) {
    return res.status(400).json({ error: "At least one field required to update" });
  }

  const fields = [];
  const values = [];
  if (start_time) {
    fields.push("start_time = ?");
    values.push(start_time);
  }
  if (end_time) {
    fields.push("end_time = ?");
    values.push(end_time);
  }
  if (class_id) {
    fields.push("class_id = ?");
    values.push(class_id);
  }
  if (event_title) {
    fields.push("event_title = ?");
    values.push(event_title);
  }
  values.push(eventId);

  const query = `UPDATE calendar SET ${fields.join(", ")} WHERE idcalendar = ?`;

  try {
    const [result] = await db.query(query, values);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Calendar event not found" });

    const [rows] = await db.query('SELECT * FROM calendar WHERE idcalendar = ?', [eventId]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /calendar/:id
app.delete('/calendar/:id', async (req, res) => {
  const eventId = parseInt(req.params.id);
  try {
    const [result] = await db.query('DELETE FROM calendar WHERE idcalendar = ?', [eventId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Calendar event not found" });
    res.json({ message: `Deleted calendar event with id ${eventId}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /calendar
app.delete('/calendar', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM calendar');
    res.json({ message: `Deleted ${result.affectedRows} calendar events` });
  } catch (err) {
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
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/classes/:id
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
    res.status(500).json({ error: err.message });
  }
});

// GET /api/classes/:id
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
      c.teacher_id,
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
    res.status(500).json({ error: err.message });
  }
});

// GET /students/by-grade/:grade
app.get('/students/by-grade/:grade', async (req, res) => {
  const grade = req.params.grade;
  const query = 'SELECT * FROM user WHERE role = "student" AND grade = ?';

  try {
    const [results] = await db.query(query, [grade]);
    res.json(results);
  } catch (err) {
    console.error('Error fetching students by grade:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /class/:id/students
app.post('/api/class/:id/students', async (req, res) => {
  const classId = req.params.id;
  const studentIds = req.body.studentIds;

  if (!Array.isArray(studentIds)) {
    return res.status(400).json({ error: 'studentIds must be an array' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query('DELETE FROM student_class WHERE class_id = ?', [classId]);

    if (studentIds.length > 0) {
      const values = studentIds.map(id => [classId, id]);
      // The query syntax for bulk insert with ? is ('INSERT INTO table (cols) VALUES ?', [values])
      // but mysql2 requires the array wrapped differently:
      await connection.query('INSERT INTO student_class (class_id, user_id) VALUES ?', [values]);
    }

    await connection.commit();
    res.status(200).json({ message: 'Students assigned to class' });
  } catch (err) {
    await connection.rollback();
    console.error('Error assigning students:', err);
    res.status(500).send('Server error');
  } finally {
    connection.release();
  }
});

// GET /api/students/grade/:grade
app.get('/api/students/grade/:grade', async (req, res) => {
  const grade = req.params.grade;
  try {
    const [students] = await db.query(
      'SELECT id, first_name, last_name FROM user WHERE role = "student" AND grade = ?',
      [grade]
    );
    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
