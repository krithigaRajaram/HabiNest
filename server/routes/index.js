const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const habitRoutes = require('./habits');
const habitStatusRoutes = require('./habitStatus');

router.use('/auth', authRoutes);
router.use('/habits', habitRoutes);
router.use('/habit-status', habitStatusRoutes);

module.exports = router;
