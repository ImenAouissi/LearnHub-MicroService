const router = require('express').Router();
const { pool } = require('../db/postgres');
const asyncHandler = require('../middleware/asyncHandler');

// Routes INTERNES pour les tableaux de bord (appelées par la gateway)
//   ?userId=3          -> chiffres d'un étudiant
//   ?courseIds=a,b     -> nombre d'étudiants distincts inscrits à ces cours (formateur)
//   (aucun paramètre)  -> nombre total d'inscriptions (admin)
router.get('/stats', asyncHandler(async (req, res) => {
  if (req.query.userId) {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS enrolled,
              COUNT(*) FILTER (WHERE progress = 100)::int AS completed,
              COALESCE(ROUND(AVG(progress)), 0)::int AS average
       FROM enrollments WHERE user_id = $1`,
      [Number(req.query.userId)]
    );
    return res.json(rows[0]);
  }
  if (req.query.courseIds !== undefined) {
    const ids = String(req.query.courseIds).split(',').filter(Boolean);
    const { rows } = await pool.query(
      'SELECT COUNT(DISTINCT user_id)::int AS students FROM enrollments WHERE course_id = ANY($1::text[])',
      [ids]
    );
    return res.json(rows[0]);
  }
  const { rows } = await pool.query('SELECT COUNT(*)::int AS enrollments FROM enrollments');
  res.json(rows[0]);
}));

module.exports = router;
