const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Users route (all active users)
app.get('/api/users', (req, res) => {
  const query = `
    SELECT id, first_name, last_name, role 
    FROM user 
    WHERE status = 1
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Students route
app.get('/api/students', (req, res) => {
  const query = `
    SELECT id, first_name, last_name, role 
    FROM user 
    WHERE role = 'student' AND status = 1
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Teachers route
app.get('/api/teachers', (req, res) => {
  const query = `
    SELECT id, first_name, last_name, role 
    FROM user 
    WHERE role = 'teacher' AND status = 1
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Calendar routes
app.get('/allCalendars', (req, res) => {
  const query = `
    SELECT c.idcalendar, c.start_time, c.end_time, c.class_id, cl.class_name
    FROM calendar c
    JOIN class cl ON c.class_id = cl.id
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/myCalendar', (req, res) => {
  const studentId = req.query.userId;

  if (!studentId) {
    return res.status(400).json({ error: "Missing userId query parameter" });
  }

  const query = `
    SELECT c.idcalendar, c.start_time, c.end_time, c.class_id, cl.class_name
    FROM calendar c
    JOIN class cl ON c.class_id = cl.id
    JOIN student_class sc ON sc.class_id = cl.id
    WHERE sc.user_id = ?
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/calendar', (req, res) => {
  const { start_time, end_time, class_id } = req.body;

  if (!start_time || !end_time || !class_id) {
    return res.status(400).json({ error: "Missing start_time, end_time, or class_id" });
  }

  const query = `
    INSERT INTO calendar (start_time, end_time, class_id)
    VALUES (?, ?, ?)
  `;

  db.query(query, [start_time, end_time, class_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({
      idcalendar: result.insertId,
      start_time,
      end_time,
      class_id,
    });
  });
});

app.put('/calendar/:id', (req, res) => {
  const eventId = parseInt(req.params.id);
  const { start_time, end_time, class_id } = req.body;

  if (!start_time && !end_time && !class_id) {
    return res.status(400).json({ error: "At least one field (start_time, end_time, class_id) is required to update" });
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

  values.push(eventId);

  const query = `
    UPDATE calendar SET ${fields.join(", ")} WHERE idcalendar = ?
  `;

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Calendar event not found" });
    }

    db.query('SELECT * FROM calendar WHERE idcalendar = ?', [eventId], (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json(rows[0]);
    });
  });
});

app.delete('/calendar/:id', (req, res) => {
  const eventId = parseInt(req.params.id);

  db.query('DELETE FROM calendar WHERE idcalendar = ?', [eventId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Calendar event not found" });
    }

    res.json({ message: `Deleted calendar event with id ${eventId}` });
  });
});

app.delete('/calendar', (req, res) => {
  db.query('DELETE FROM calendar', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `Deleted ${result.affectedRows} calendar events` });
  });
});

// Server listener
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
