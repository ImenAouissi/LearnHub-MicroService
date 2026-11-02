const { Pool } = require('pg');
const { databaseUrl } = require('../config');

const pool = new Pool({ connectionString: databaseUrl });

// user_id et course_id viennent d'AUTRES services (et d'autres bases) :
// aucune clé étrangère possible. On stocke seulement leur identifiant.
async function initPostgres() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL,
      course_id  VARCHAR(30) NOT NULL,
      progress   INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (user_id, course_id)
    )`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS completed_chapters (
      enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
      chapter_id    VARCHAR(30) NOT NULL,
      PRIMARY KEY (enrollment_id, chapter_id)
    )`);
}

module.exports = { pool, initPostgres };
