
const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const auth = require('../middleware/authMiddleware');

// Create a new habit
router.post('/', auth, async (req, res) => {
  try {
    const { title, color, frequency, icon } = req.body;
    const habit = await Habit.create({ user: req.user, title, color, frequency, icon });
    res.status(201).json(habit);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all habits of logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete a habit
router.delete('/:id', auth, async (req, res) => {
  try {
    await Habit.findOneAndDelete({ _id: req.params.id, user: req.user });
    res.json({ msg: 'Habit deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
