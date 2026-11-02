const router = require('express').Router();
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');

// Route INTERNE pour le tableau de bord étudiant : nombre de notifications
router.get('/stats', asyncHandler(async (req, res) => {
  const notifications = await Notification.countDocuments({ userId: Number(req.query.userId) });
  res.json({ notifications });
}));

module.exports = router;
