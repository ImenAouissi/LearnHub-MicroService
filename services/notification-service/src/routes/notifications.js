const router = require('express').Router();
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

// Mes notifications
router.get('/mine', authenticate, asyncHandler(async (req, res) => {
  const list = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(list);
}));

module.exports = router;
