const express = require('express');
const mongoose = require('mongoose');
const { port, mongoUrl } = require('./config');
const { connectRabbit } = require('./messaging');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'course-service', status: 'ok' }));
app.use('/api/courses', require('./routes/courses'));
app.use('/internal', require('./routes/internal'));

app.use((req, res) => res.status(404).json({ error: 'Route introuvable' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Erreur serveur' });
});

async function start() {
  await mongoose.connect(mongoUrl);
  console.log('MongoDB (courses_db) connecté');
  await connectRabbit();
  app.listen(port, () => console.log(`course-service sur le port ${port}`));
}

start().catch((err) => {
  console.error('Démarrage impossible', err);
  process.exit(1);
});
