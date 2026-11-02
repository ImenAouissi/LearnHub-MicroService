const express = require('express');
const bcrypt = require('bcryptjs');
const { port, adminEmail, adminPassword } = require('./config');
const { pool, initPostgres } = require('./db/postgres');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'user-service', status: 'ok' }));
app.use('/api/users', require('./routes/users'));
app.use('/internal', require('./routes/internal'));

app.use((req, res) => res.status(404).json({ error: 'Route introuvable' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Erreur serveur' });
});

// Crée le compte administrateur au premier démarrage
async function seedAdmin() {
  if (!adminEmail || !adminPassword) return;
  const exists = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
  if (exists.rows.length === 0) {
    const hash = await bcrypt.hash(adminPassword, 10);
    await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ('Administrateur', $1, $2, 'admin')",
      [adminEmail, hash]
    );
    console.log('Compte admin créé :', adminEmail);
  }
}

async function start() {
  await initPostgres();
  console.log('PostgreSQL (users_db) connecté, table prête');
  await seedAdmin();
  app.listen(port, () => console.log(`user-service sur le port ${port}`));
}

start().catch((err) => {
  console.error('Démarrage impossible', err);
  process.exit(1);
});
