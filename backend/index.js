const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://webhook.site/6c52c9f2-1234-5678-90ab-cdefghijklmn';

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('SQLite database initialized');
});

// Create jobs table
db.run(`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    taskName TEXT NOT NULL,
    payload TEXT,
    priority TEXT DEFAULT 'Medium',
    status TEXT DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    completedAt DATETIME
  )
`);

// POST /jobs - Create a new job
app.post('/jobs', (req, res) => {
  const { taskName, payload, priority } = req.body;
  
  if (!taskName) {
    return res.status(400).json({ error: 'taskName is required' });
  }

  const stmt = db.prepare('INSERT INTO jobs (taskName, payload, priority) VALUES (?, ?, ?)');
  stmt.run([taskName, JSON.stringify(payload), priority || 'Medium'], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, taskName, payload, priority, status: 'pending' });
  });
});

// GET /jobs - List all jobs
app.get('/jobs', (req, res) => {
  const { status, priority } = req.query;
  let query = 'SELECT * FROM jobs';
  const params = [];

  if (status || priority) {
    const filters = [];
    if (status) {
      filters.push('status = ?');
      params.push(status);
    }
    if (priority) {
      filters.push('priority = ?');
      params.push(priority);
    }
    query += ' WHERE ' + filters.join(' AND');
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET /jobs/:id - Get job details
app.get('/jobs/:id', (req, res) => {
  db.get('SELECT * FROM jobs WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Job not found' });
    if (row.payload) row.payload = JSON.parse(row.payload);
    res.json(row);
  });
});

// POST /run-job/:id - Run a job
app.post('/run-job/:id', async (req, res) => {
  const jobId = req.params.id;

  // Set status to running
  db.run('UPDATE jobs SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', ['running', jobId]);

  // Simulate processing (3 seconds)
  setTimeout(() => {
    const completedAt = new Date().toISOString();
    db.run('UPDATE jobs SET status = ?, completedAt = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', 
      ['completed', completedAt, jobId]);

    // Get job data
    db.get('SELECT * FROM jobs WHERE id = ?', [jobId], async (err, job) => {
      if (err || !job) {
        console.error('Job not found for webhook');
        return;
      }

      // Send webhook
      try {
        const webhookPayload = {
          jobId: job.id,
          taskName: job.taskName,
          priority: job.priority,
          payload: job.payload ? JSON.parse(job.payload) : null,
          completedAt: completedAt
        };

        const response = await axios.post(WEBHOOK_URL, webhookPayload);
        console.log('Webhook sent successfully:', response.status);
      } catch (error) {
        console.error('Webhook error:', error.message);
      }
    });
  }, 3000);

  res.json({ message: 'Job started', jobId });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

module.exports = app;
