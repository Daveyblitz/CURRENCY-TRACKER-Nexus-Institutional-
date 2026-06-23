const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const db = require('./db')

const app = express()
const PORT = process.env.PORT || 5000
const clientDistPath = path.join(__dirname, '../client/dist')

app.use(cors())
app.use(express.json())

app.set('db', db)

async function initializeDatabase() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY,
      username TEXT NOT NULL DEFAULT 'Guest Developer',
      country_code TEXT NOT NULL DEFAULT 'NG',
      base_currency TEXT NOT NULL DEFAULT 'USD',
      theme TEXT NOT NULL DEFAULT 'dark',
      bitnob_api_key TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await db.query(`
    INSERT INTO user_settings (id, username, country_code, base_currency, theme, bitnob_api_key)
    VALUES (1, 'Guest Developer', 'NG', 'USD', 'dark', '')
    ON CONFLICT (id) DO NOTHING
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      country_code TEXT NOT NULL DEFAULT 'NG',
      password_salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}

initializeDatabase().catch((err) => {
  console.error('Failed to initialize PostgreSQL schema:', err.message)
})

const apiRouter = require('./routes/api')
app.use('/api', apiRouter)

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath))

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next()
    }

    return res.sendFile(path.join(clientDistPath, 'index.html'))
  })
}

app.get('/', (req, res) => {
  if (fs.existsSync(path.join(clientDistPath, 'index.html'))) {
    return res.sendFile(path.join(clientDistPath, 'index.html'))
  }

  res.send('Nexus Financial Intelligence backend is running. Build the client to serve the frontend from this service.')
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log('PostgreSQL connection ready.')
})