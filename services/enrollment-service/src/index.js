const express = require('express');
const { port } = require('./config');
const { initPostgres } = require('./db/postgres');
const { connectRabbit } = require('./messaging');
const { startConsumers } = require('./consumers');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'enrollment-service', status: 'ok' }));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/internal', require('./routes/internal'));

app.use((req, res) => res.status(404).json({ error: 'Route introuvable' }));
app.use((err, req, res, next) => {
  if (err.status) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur' });
});

async function start() {
  await initPostgres();
  console.log('PostgreSQL (enrollments_db) connecté, tables prêtes');
  await connectRabbit();
  await startConsumers();
  app.listen(port, () => console.log(`enrollment-service sur le port ${port}`));
}

start().catch((err) => {
  console.error('Démarrage impossible', err);
  process.exit(1);
});
