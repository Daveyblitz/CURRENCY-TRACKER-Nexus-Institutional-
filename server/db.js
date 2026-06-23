const { Pool } = require('pg')

function buildPoolConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }
  }

  const config = {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'currency_tracker',
  }

  if (process.env.PGSSLMODE === 'require') {
    config.ssl = { rejectUnauthorized: false }
  }

  return config
}

const pool = new Pool(buildPoolConfig())

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message)
})

function toPgQuery(sql) {
  let index = 0
  return String(sql).replace(/\?/g, () => {
    index += 1
    return `$${index}`
  })
}

function get(sql, params, callback) {
  pool.query(toPgQuery(sql), params || [])
    .then((result) => callback(null, result.rows[0] || null))
    .catch((error) => callback(error))
}

function all(sql, params, callback) {
  pool.query(toPgQuery(sql), params || [])
    .then((result) => callback(null, result.rows))
    .catch((error) => callback(error))
}

function run(sql, params, callback) {
  pool.query(toPgQuery(sql), params || [])
    .then((result) => callback && callback.call({ rowCount: result.rowCount }, null, result))
    .catch((error) => callback && callback(error))
}

async function query(sql, params) {
  return pool.query(toPgQuery(sql), params || [])
}

module.exports = {
  pool,
  get,
  all,
  run,
  query,
}