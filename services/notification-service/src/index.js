const express = require('express');
const mongoose = require('mongoose');
const { port, mongoUrl } = require('./config');
const { connectRabbit } = require('./messaging');
const { startConsumers } = require('./consumers');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'notification-service', status: 'ok' }));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/internal', require('./routes/internal'));

app.use((req, res) => res.status(404).json({ error: 'Route introuvable' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur' });
});

async function start() {
  await mongoose.connect(mongoUrl);
  console.log('MongoDB (notifications_db) connecté');
  await connectRabbit();
  await startConsumers();
  app.listen(port, () => console.log(`notification-service sur le port ${port}`));
}

start().catch((err) => {
  console.error('Démarrage impossible', err);
  process.exit(1);
});
