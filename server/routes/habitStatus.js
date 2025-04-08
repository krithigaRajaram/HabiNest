const express = require('express');
const router = express.Router();
const HabitStatus = require('../models/HabitStatus');
const auth = require('../middleware/authMiddleware');

// Mark habit complete/incomplete
router.post('/', auth, async (req, res) => {
  try {
    const { habitId, date, completed } = req.body;

    const status = await HabitStatus.findOneAndUpdate(
      { habit: habitId, date },
      { completed },
      { upsert: true, new: true }
    );

    res.json(status);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get status for a date
router.get('/:date', auth, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const statuses = await HabitStatus.find({ date })
      .populate('habit')
      .where('habit.user')
      .equals(req.user);

    res.json(statuses);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
