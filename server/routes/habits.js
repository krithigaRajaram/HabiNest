const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createHabit, getHabits, getHabitById, updateHabit, deleteHabit } = require('../controllers/habitController');

router.post('/', auth, createHabit);
router.get('/', auth, getHabits);
router.get('/:id', auth, getHabitById);
router.put('/:id', auth, updateHabit);
router.delete('/:id', auth, deleteHabit);

module.exports = router;