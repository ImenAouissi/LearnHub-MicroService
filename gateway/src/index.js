const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { port, urls } = require('./config');

const app = express();
app.use(cors());
// IMPORTANT : pas de express.json() ici. La gateway ne lit pas les corps de requête,
// elle les fait simplement passer vers le bon service.

// Transmet toutes les requêtes dont l'adresse commence par "path" vers le service "target"
function route(path, target) {
  return createProxyMiddleware({
    pathFilter: path,
    target,
    changeOrigin: true,
    on: {
      error: (err, req, res) => {
        console.error(`Service injoignable (${target}) :`, err.message);
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Service momentanément indisponible' }));
      },
    },
  });
}

// Vérifie quels services répondent : http://localhost:5000/api/health
app.get('/api/health', async (req, res) => {
  const services = {};
  await Promise.all(
    Object.entries(urls).map(async ([name, url]) => {
      try {
        const r = await fetch(`${url}/health`, { signal: AbortSignal.timeout(2000) });
        services[name] = r.ok ? 'ok' : 'erreur';
      } catch {
        services[name] = 'injoignable';
      }
    })
  );
  res.json({ gateway: 'ok', services });
});

// Les statistiques sont COMPOSÉES par la gateway (voir stats.js)
app.use('/api/stats', require('./stats'));

// Table de routage : quelle adresse va vers quel service
app.use(route('/api/users', urls.user));
app.use(route('/api/courses', urls.course));
app.use(route('/api/enrollments', urls.enrollment));
app.use(route('/api/notifications', urls.notification));

// Les routes /internal/... ne sont PAS dans cette table : elles restent invisibles de l'extérieur.
app.use((req, res) => res.status(404).json({ error: 'Route introuvable' }));

app.listen(port, () => console.log(`gateway sur le port ${port}`));
