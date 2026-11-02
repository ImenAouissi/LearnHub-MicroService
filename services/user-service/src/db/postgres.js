const { Pool } = require('pg');
const { databaseUrl } = require('../config');

const pool = new Pool({ connectionString: databaseUrl });

// Ce service ne possède QU'UNE table : users. Les inscriptions ne sont plus ici.
async function initPostgres() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      name          VARCHAR(100) NOT NULL,
      email         VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(100) NOT NULL,
      role          VARCHAR(20)  NOT NULL CHECK (role IN ('etudiant', 'formateur', 'admin')),
      created_at    TIMESTAMP DEFAULT NOW()
    )`);
}

module.exports = { pool, initPostgres };
