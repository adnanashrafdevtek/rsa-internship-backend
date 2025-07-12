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


// PUT /calendar/:id
app.put('/calendar/:id', (req, res) => {
  const eventId = parseInt(req.params.id);
  const { title, date, ownerId } = req.body;

  const event = calendarEvents.find(e => e.id === eventId);
  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  if (title) event.title = title;
  if (date) event.date = date;
  if (ownerId) event.ownerId = ownerId;

  res.json(event);
});


// DELETE /calendar/:id - delete one event by id
app.delete('/calendar/:id', (req, res) => {
  const eventId = parseInt(req.params.id);
  const index = calendarEvents.findIndex(e => e.id === eventId);
  if (index === -1) return res.status(404).json({ error: "Event not found" });

  const deletedEvent = calendarEvents.splice(index, 1);
  res.json(deletedEvent[0]);
});

// DELETE /calendar - delete all calendar events
app.delete('/calendar', (req, res) => {
  calendarEvents.length = 0;  // clears the array in place
  res.json({ message: "All calendar events deleted" });
});

// Server listener (keep this at the very end)
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
