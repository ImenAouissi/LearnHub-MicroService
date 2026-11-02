const router = require('express').Router();
const { pool } = require('../db/postgres');
const asyncHandler = require('../middleware/asyncHandler');

// Routes INTERNES : appelées par la gateway pour composer le tableau de bord admin.
// Elles ne sont pas exposées par la gateway, donc invisibles depuis le navigateur.
router.get('/stats', asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT role, COUNT(*)::int AS n FROM users GROUP BY role');
  const byRole = { etudiant: 0, formateur: 0, admin: 0 };
  rows.forEach((r) => { byRole[r.role] = r.n; });
  res.json({ ...byRole, total: byRole.etudiant + byRole.formateur + byRole.admin });
}));

module.exports = router;
