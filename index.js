const express = require('express');
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
// db.js
require('dotenv').config(); // 👈 Load environment variables

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('❌ DB Connection Error:', err);
  } else {
    console.log('✅ Connected to MySQL!');
  }
});

module.exports = connection;
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
app.get('/allCalendars', (req, res) => {
  res.json(calendarEvents);
});

// Start server

// Calendar Route: GET /myCalendar
app.get('/myCalendar', (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId query parameter" });
  }

  const myEvents = calendarEvents.filter(event => event.ownerId === userId);
  res.json(myEvents);
});

// Calendar Route: POST /calendar
app.post('/calendar', (req, res) => {
  const { title, date, ownerId } = req.body;

  if (!title || !date || !ownerId) {
    return res.status(400).json({ error: "Missing title, date, or ownerId" });
  }

  const newEvent = {
    id: calendarEvents.length + 1,
    title,
    date,
    ownerId
  };

  calendarEvents.push(newEvent);
  res.status(201).json(newEvent);
});


app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
