const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { updateHabitStatus, getStatusByDate, getStreak } = require('../controllers/habitStatusController');

router.post('/', auth, updateHabitStatus);
router.get('/streak/:habitId', auth, getStreak);
router.get('/:date', auth, getStatusByDate);

module.exports = router;