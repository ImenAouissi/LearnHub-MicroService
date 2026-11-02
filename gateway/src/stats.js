const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { jwtSecret, urls } = require('./config');

// Appel HTTP simple vers un service, avec un délai maximum
async function get(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
  if (!res.ok) throw new Error(`${url} a répondu ${res.status}`);
  return res.json();
}

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Connexion requise' });
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: 'Session expirée, reconnectez-vous' });
  }
}

// COMPOSITION D'API : dans le monolithe, une seule fonction lisait les deux bases.
// Ici, les données sont dans plusieurs services : la gateway les interroge et assemble la réponse.
router.get('/me', authenticate, async (req, res) => {
  const { id, role } = req.user;
  try {
    if (role === 'etudiant') {
      const [enrollments, notifications] = await Promise.all([
        get(`${urls.enrollment}/internal/stats?userId=${id}`),
        // Si le service des notifications est en panne, le tableau de bord s'affiche quand même (0 notification)
        get(`${urls.notification}/internal/stats?userId=${id}`).catch(() => ({ notifications: 0 })),
      ]);
      return res.json({ role, ...enrollments, ...notifications });
    }

    if (role === 'formateur') {
      const courses = await get(`${urls.course}/internal/stats?ownerId=${id}`);
      const enrollments = await get(`${urls.enrollment}/internal/stats?courseIds=${courses.courseIds.join(',')}`);
      return res.json({ role, courses: courses.courses, chapters: courses.chapters, students: enrollments.students });
    }

    // admin
    const [users, courses, enrollments] = await Promise.all([
      get(`${urls.user}/internal/stats`),
      get(`${urls.course}/internal/stats`),
      get(`${urls.enrollment}/internal/stats`),
    ]);
    res.json({
      role,
      users: users.total,
      students: users.etudiant,
      teachers: users.formateur,
      courses: courses.courses,
      enrollments: enrollments.enrollments,
    });
  } catch (err) {
    console.error('Composition des statistiques impossible :', err.message);
    res.status(503).json({ error: 'Un service est momentanément indisponible' });
  }
});

module.exports = router;
