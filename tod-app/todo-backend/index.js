// todo-backend/index.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

// Ensure table exists
pool.query(`
  CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`).then(() => console.log("✅ Todos table ready with status field"))
  .catch(err => console.error("❌ Error creating table", err));

// Root route
app.get('/', (req, res) => res.send('✅ Todo API is running. Use /todos for data'));

// Get all todos
app.get('/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Add new todo
app.post('/todos', async (req, res) => {
  try {
    const { text, status } = req.body;
    const result = await pool.query(
      'INSERT INTO todos (text, status) VALUES ($1, $2) RETURNING *',
      [text, status || 'pending']
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ✅ Update status only
app.put('/todos/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // only status field
    if (!['pending', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE todos SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete todo
app.delete('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM todos WHERE id=$1', [id]);
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Clear all todos
app.delete('/todos', async (req, res) => {
  try {
    await pool.query('DELETE FROM todos');
    res.json({ message: 'All todos cleared' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Start server
app.listen(3000, () => console.log('🚀 Server running on port 3000'));
