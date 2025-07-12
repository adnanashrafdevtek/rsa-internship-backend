const express = require('express');
const db = require('./db');
const app = express();
const PORT = 3000;


app.use(express.json());

// Dummy book data
const books = [
  { id: 1, title: "The Hobbit", author: "J.R.R. Tolkien" },
  { id: 2, title: "1984", author: "George Orwell" },
];


// Dummy calendar data
const calendarEvents = [
  { id: 1, title: "Field Trip", date: "2025-07-01", ownerId: "student123" },
  { id: 2, title: "Math Exam", date: "2025-07-05", ownerId: "student123" },
  { id: 3, title: "Basketball Game", date: "2025-07-10", ownerId: "student456" },
];

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  res.status(403).json("your login failed");
});
// Book Routes
app.get('/books', (req, res) => {
  res.json(books);
});

app.get('/books/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ error: "Book not found" });
  res.json(book);
});

app.post('/books', (req, res) => {
  const { title, author } = req.body;
  const newBook = { id: books.length + 1, title, author };
  books.push(newBook);
  res.status(201).json(newBook);
});

app.put('/books/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ error: "Book not found" });

  const { title, author } = req.body;
  book.title = title ?? book.title;
  book.author = author ?? book.author;

  res.json(book);
});

app.delete('/books/:id', (req, res) => {
  const index = books.findIndex(b => b.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Book not found" });

  const deleted = books.splice(index, 1);
  res.json(deleted[0]);
});

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



// get/ myCalendar

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


// Calendar Route: POST /calendar
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

    // Return the newly created event with its auto-generated idcalendar
    res.status(201).json({
      idcalendar: result.insertId,
      start_time,
      end_time,
      class_id,
    });
  });
});


// PUT /calendar/:id
app.put('/calendar/:id', (req, res) => {
  const eventId = parseInt(req.params.id);
  const { start_time, end_time, class_id } = req.body;

  if (!start_time && !end_time && !class_id) {
    return res.status(400).json({ error: "At least one field (start_time, end_time, class_id) is required to update" });
  }

  // Build dynamic query parts and values based on what was sent
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

    // Return the updated event (fetch fresh from DB)
    db.query('SELECT * FROM calendar WHERE idcalendar = ?', [eventId], (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json(rows[0]);
    });
  });
});



// DELETE /calendar/:id - delete one event by id
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


// DELETE /calendar - delete all calendar events
app.delete('/calendar', (req, res) => {
  db.query('DELETE FROM calendar', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `Deleted ${result.affectedRows} calendar events` });
  });
});



// Server listener (keep this at the very end)
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
