const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  updateHabitStatus,
  getStatusByDate
} = require('../controllers/habitStatusController');

router.post('/', auth, updateHabitStatus);
router.get('/:date', auth, getStatusByDate);

module.exports = router;
