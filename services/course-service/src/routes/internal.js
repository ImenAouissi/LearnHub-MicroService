const router = require('express').Router();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const asyncHandler = require('../middleware/asyncHandler');

// Routes INTERNES : appelées par les AUTRES SERVICES (pas par le navigateur).
// Elles renvoient une version "légère" du cours : les titres des chapitres, sans leur contenu.
const toSummary = (c) => ({
  _id: String(c._id),
  title: c.title,
  category: c.category,
  ownerName: c.ownerName,
  chapters: c.chapters.map((ch) => ({ _id: String(ch._id), title: ch.title })),
});

// Plusieurs cours d'un coup : GET /internal/courses/batch?ids=a,b,c
router.get('/courses/batch', asyncHandler(async (req, res) => {
  const ids = String(req.query.ids || '').split(',').filter((id) => mongoose.isValidObjectId(id));
  const courses = await Course.find({ _id: { $in: ids } });
  res.json(courses.map(toSummary));
}));

// Un seul cours
router.get('/courses/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Cours introuvable' });
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ error: 'Cours introuvable' });
  res.json(toSummary(course));
}));

// Chiffres pour les tableaux de bord : ?ownerId=3 (un formateur) ou sans paramètre (tous les cours)
router.get('/stats', asyncHandler(async (req, res) => {
  const filter = req.query.ownerId ? { ownerId: Number(req.query.ownerId) } : {};
  const courses = await Course.find(filter).select('chapters');
  res.json({
    courses: courses.length,
    chapters: courses.reduce((sum, c) => sum + c.chapters.length, 0),
    courseIds: courses.map((c) => String(c._id)),
  });
}));

module.exports = router;
