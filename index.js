const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Dummy books array
const books = [
  { id: 1, title: "The Hobbit", author: "J.R.R. Tolkien" },
  { id: 2, title: "1984", author: "George Orwell" },
];

// Dummy calendars array
const calendars = [
  { id: 1, name: "Work Calendar", owner: "Alice" },
  { id: 2, name: "School Calendar", owner: "Bob" }
];

// Dummy login route (always fails for now)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  res.status(403).json("your login failed");
});

// Books Routes
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
  res.json(calendars);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});