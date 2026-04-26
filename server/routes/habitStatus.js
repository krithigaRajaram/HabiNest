const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { 
  updateHabitStatus, 
  getStatusByDate, 
  getStreak, 
  getHabitHistory,
  getReportsOverview 
} = require('../controllers/habitStatusController');

// Order matters: specific routes first
router.post('/', auth, updateHabitStatus);
router.get('/reports/overview', auth, getReportsOverview);  // NEW: Reports overview
router.get('/streak/:habitId', auth, getStreak);
router.get('/habit/:habitId', auth, getHabitHistory);
router.get('/:date', auth, getStatusByDate);

module.exports = router;