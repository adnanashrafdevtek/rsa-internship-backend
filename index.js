const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());



//TASKS
/*
1 - Upon adding  a new user, send unique activation link
2- when user clicks on activation link, let him set new password and activate account

*/

app.post('/api/user', (req, res) => {
  // ignore userId param for now
  // firstname, lastname, email,  role, listOfClasses
  const { firstName, lastName , emailAddress, address, role} = req.body;
  
  const sql = `INSERT INTO user (first_name, last_name, email, address, status,password, role) VALUES (?, ?, ?, ?,?,?,?)`;
  db.query(sql, [firstName, lastName, emailAddress, address,0,"aasdsasdaa",role], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      id: result.insertId,
      firstName
    });
  });
});

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

// Classes GET route
app.get('/api/classes', (req, res) => {
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

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

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
});

// Classes POST route - Add new class
app.post('/api/classes', (req, res) => {
  const { name, grade_level, teacher_id, start_time, end_time, recurring_days } = req.body;

  if (!name || !grade_level || !teacher_id) {
    return res.status(400).json({ error: "Name, grade_level, and teacher_id are required" });
  }

  const sql = `INSERT INTO class (name, grade_level, teacher_id, start_time, end_time, recurring_days) VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(sql, [name, grade_level, teacher_id, start_time || null, end_time || null, recurring_days || null], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      id: result.insertId,
      name,
      grade_level,
      teacher_id,
      start_time,
      end_time,
      recurring_days,
    });
  });
});

// Calendar routes
app.get('/myCalendar', (req, res) => {
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

// Delete a class by ID
app.delete('/api/classes/:id', (req, res) => {
  const classId = parseInt(req.params.id);
  if (!classId) return res.status(400).json({ error: "Invalid class ID" });

  db.query('DELETE FROM class WHERE id = ?', [classId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Class not found" });

    res.json({ message: `Class ${classId} deleted successfully` });
  });
});

// Update a class
app.put('/api/classes/:id', (req, res) => {
  const classId = parseInt(req.params.id);
  const { name, grade_level, teacher_id, start_time, end_time, recurring_days } = req.body;

  const query = `
    UPDATE class
    SET name = ?, grade_level = ?, teacher_id = ?, start_time = ?, end_time = ?, recurring_days = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [name, grade_level, teacher_id, start_time, end_time, recurring_days, classId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: 'Class not found' });

      res.json({ message: 'Class updated successfully' });
    }
  );
});

// Get class by ID
app.get('/api/classes/:id', (req, res) => {
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

  db.query(query, [classId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Class not found' });

    res.json(results[0]);
  });
});

// Server listener
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
