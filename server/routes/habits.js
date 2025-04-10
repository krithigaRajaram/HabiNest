const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createHabit,
  getHabits,
  deleteHabit
} = require('../controllers/habitController');

router.post('/', auth, createHabit);
router.get('/', auth, getHabits);
router.delete('/:id', auth, deleteHabit);

module.exports = router;
