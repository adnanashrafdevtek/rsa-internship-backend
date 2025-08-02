const express = require('express');
const cors = require('cors');
const db = require('./db');
const crypto = require('crypto'); // 🔥 You missed this import!
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// TASKS
/*
1 - Upon adding a new user, send unique activation link
2 - When user clicks on activation link, let them set a new password and activate the account
*/

const { ComposioToolSet } = require("composio");
const composio = new ComposioToolSet({ apiKey: process.env.COMPOSIO_API_KEY });

// Create User with Activation Email
app.post('/api/user', async (req, res) => {
  const { firstName, lastName, emailAddress, address, role } = req.body;

  if (!firstName || !lastName || !emailAddress || !address || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Generate secure activation token
  const activationToken = crypto.randomBytes(32).toString("hex");
  const activationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const sql = `
    INSERT INTO user 
      (first_name, last_name, email, address, status, password, role, activation_token, activation_expires)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [firstName, lastName, emailAddress, address, 0, '', role, activationToken, activationExpires],
    async (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      try {
        const activationLink = `${process.env.FRONTEND_URL}/activate/${activationToken}`;

        // Send activation email via Composio
        await composio.gmail.sendMessage({
          to: emailAddress,
          subject: "Activate your RSA Scheduler Account",
          html: `
            <h2>Welcome ${firstName}!</h2>
            <p>Your account has been created. Please activate it within 24 hours:</p>
            <p><a href="${activationLink}">Activate My Account</a></p>
          `,
        });

        res.json({
          id: result.insertId,
          message: "User created and activation email sent"
        });
      } catch (emailErr) {
        console.error("Email error:", emailErr);
        res.status(500).json({
          error: "User created but failed to send activation email"
        });
      }
    }
  );
});

// Get active users
app.get('/api/users', (req, res) => {
  const query = `SELECT id, first_name, last_name, role FROM user WHERE status = 1`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get active students
app.get('/api/students', (req, res) => {
  const query = `SELECT id, first_name, last_name, role FROM user WHERE role = 'student' AND status = 1`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get active teachers
app.get('/api/teachers', (req, res) => {
  const query = `SELECT id, first_name, last_name, role FROM user WHERE role = 'teacher' AND status = 1`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get calendar events
app.get('/myCalendar', (req, res) => {
  const query = `SELECT idcalendar, start_time, end_time, class_id, event_title FROM calendar`;

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

// Update calendar event
app.put('/calendar/:id', (req, res) => {
  const eventId = parseInt(req.params.id);
  const { start_time, end_time, class_id, event_title } = req.body;

  if (!start_time && !end_time && !class_id && !event_title) {
    return res.status(400).json({ error: "At least one field is required to update" });
  }

  const fields = [];
  const values = [];

  if (start_time) { fields.push("start_time = ?"); values.push(start_time); }
  if (end_time) { fields.push("end_time = ?"); values.push(end_time); }
  if (class_id) { fields.push("class_id = ?"); values.push(class_id); }
  if (event_title) { fields.push("event_title = ?"); values.push(event_title); }

  values.push(eventId);

  const query = `UPDATE calendar SET ${fields.join(", ")} WHERE idcalendar = ?`;

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

// Delete single calendar event
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

// Delete all calendar events
app.delete('/calendar', (req, res) => {
  db.query('DELETE FROM calendar', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `Deleted ${result.affectedRows} calendar events` });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
