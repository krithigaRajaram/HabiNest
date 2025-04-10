const HabitStatus = require('../models/HabitStatus');

// Mark habit complete/incomplete
const updateHabitStatus = async (req, res) => {
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
};

// Get status for a specific date
const getStatusByDate = async (req, res) => {
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
};

module.exports = {
  updateHabitStatus,
  getStatusByDate
};
