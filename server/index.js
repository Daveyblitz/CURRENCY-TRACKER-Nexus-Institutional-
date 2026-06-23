const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDatabase();
  }
});

// Expose database reference globally on app for router access
app.set('db', db);

function initializeDatabase() {
  // Create users settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      username TEXT DEFAULT 'Guest Developer',
      country_code TEXT DEFAULT 'NG',
      base_currency TEXT DEFAULT 'USD',
      theme TEXT DEFAULT 'dark',
      bitnob_api_key TEXT DEFAULT '',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating user_settings table:', err.message);
    } else {
      ensureUserSettingsColumns(() => {
        // Seed default record if not present
        db.run(`
          INSERT OR IGNORE INTO user_settings (id, username, country_code, base_currency, theme, bitnob_api_key)
          VALUES (1, 'Guest Developer', 'NG', 'USD', 'dark', '')
        `, (seedErr) => {
          if (seedErr) {
            console.error('Error seeding default settings:', seedErr.message);
          }
        });

        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            email TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            country_code TEXT NOT NULL DEFAULT 'NG',
            password_salt TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (userTableErr) => {
          if (userTableErr) {
            console.error('Error creating users table:', userTableErr.message);
          }
        });
      });
    }
  });

  // Example placeholder block: Open for historical logs table later
  /*
  db.run(`
    CREATE TABLE IF NOT EXISTS rate_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      currency_code TEXT,
      rate REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  */
}

function ensureUserSettingsColumns(done) {
  db.all("PRAGMA table_info(user_settings)", [], (err, rows) => {
    if (err) {
      console.error('Error checking user_settings schema:', err.message);
      if (typeof done === 'function') done();
      return;
    }

    const columnNames = (rows || []).map((r) => r.name);
    if (columnNames.includes('country_code')) {
      if (typeof done === 'function') done();
      return;
    }

    db.run("ALTER TABLE user_settings ADD COLUMN country_code TEXT DEFAULT 'NG'", (alterErr) => {
      if (alterErr) {
        console.error('Error adding country_code column:', alterErr.message);
      }
      if (typeof done === 'function') done();
    });
  });
}

// Attach Unified API Router
const apiRouter = require('./routes/api');
app.use('/api', apiRouter);

// Root route - simple health / info response
app.get('/', (req, res) => {
  res.send('Nexus Financial Intelligence API — backend is running. Use /api for endpoints.');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`SQLite database path: ${dbPath}`);
});