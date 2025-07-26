const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || '*' // safer for prod
}));

app.use(express.json());

// Get all tasks
app.get('/tasks', (req, res) => {
  db.query('SELECT * FROM tasks', (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// Create a task
app.post('/tasks', (req, res) => {
  const { id, name, status } = req.body;
  db.query('INSERT INTO tasks (id, name, status) VALUES (?, ?, ?)', [id, name, status], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Task added');
  });
});

// Update status (drag-drop)
app.put('/tasks/:id', (req, res) => {
  const { status } = req.body;
  db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Task updated');
  });
});

// Delete task
app.delete('/tasks/:id', (req, res) => {
  db.query('DELETE FROM tasks WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Task deleted');
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server running on port ${port}`));
