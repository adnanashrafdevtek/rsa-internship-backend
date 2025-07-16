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
app.get('/myCalendar', (req, res) => {
  // ignore userId param for now
  const query = `
    SELECT idcalendar, start_time, end_time, class_id, event_title
    FROM calendar
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const formatted = results.map(event => ({
      id: event.idcalendar,
      start_time: event.start_time,
      end_time: event.end_time,
      class_id: event.class_id,
      title: event.event_title || "No Title",
    }));

    res.json(formatted);
  });
});


// Add calendar event
app.post('/calendar', (req, res) => {
  const { start_time, end_time, class_id, event_title } = req.body;

  if (!start_time || !end_time || !class_id || !event_title) {
    return res.status(400).json({ error: "start_time, end_time, class_id, and event_title are required" });
  }

  const sql = `INSERT INTO calendar (start_time, end_time, class_id, event_title) VALUES (?, ?, ?, ?)`;
  db.query(sql, [start_time, end_time, class_id, event_title], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      idcalendar: result.insertId,
      start_time,
      end_time,
      class_id,
      event_title,
    });
  });
});

app.put('/calendar/:id', (req, res) => {
  const eventId = parseInt(req.params.id);
  const { start_time, end_time, class_id, event_title } = req.body;

  if (!start_time && !end_time && !class_id && !event_title) {
    return res.status(400).json({ error: "At least one field (start_time, end_time, class_id, event_title) is required to update" });
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
