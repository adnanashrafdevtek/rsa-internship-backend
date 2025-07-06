const express = require('express');
const app = express();
const PORT = 3000;
const db = require('./db');
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

// Calendars Route
// app.get('/allCalendars', (req, res) => {
//   res.json(calendarEvents);
// });

app.get('/allCalendars', (req, res) => {
  const sql = `
    SELECT c.id, c.start_time AS start, c.end_time AS end, cl.class_name AS title
    FROM calendar c
    JOIN class cl ON c.class_id = cl.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Start server

// Calendar Route: GET /myCalendar
app.get('/myCalendar', (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId query parameter" });
  }

  const sql = `
    SELECT c.id, c.start_time AS start, c.end_time AS end, cl.class_name AS title
    FROM calendar c
    JOIN class cl ON c.class_id = cl.id
    JOIN student_class sc ON sc.class_id = cl.id
    WHERE sc.student_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Calendar Route: POST /calendar
app.post('/calendar', (req, res) => {
  const { start, end, class_id } = req.body;

  if (!start || !end || !class_id) {
    return res.status(400).json({ error: "Missing start, end, or class_id" });
  }

  const sql = `INSERT INTO calendar (start_time, end_time, class_id) VALUES (?, ?, ?)`;
  db.query(sql, [start, end, class_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ id: result.insertId });
  });
});


app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
