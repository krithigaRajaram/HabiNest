const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  createHabit,
  getHabits,
  updateHabit,
  deleteHabit
} = require('../controllers/habitController');

router.post('/', auth, createHabit);
router.get('/', auth, getHabits);
router.put('/:id', auth, updateHabit);
router.delete('/:id', auth, deleteHabit);

module.exports = router;
