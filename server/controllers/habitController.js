const Habit = require('../models/Habit');

// Create a new habit
const createHabit = async (req, res) => {
  try {
    const { title, color, frequency, icon, description } = req.body;
    //validations
    if (!title) {
        return res.status(400).json({ msg: 'Missing required fields' });
      }
      
      if (!req.user) {
        return res.status(401).json({ msg: 'Unauthorized' });
      }
      
      const allowedFrequencies = ['Daily', 'Weekly'];
      if (!allowedFrequencies.includes(frequency)) {
        return res.status(422).json({ msg: 'Invalid frequency value. Allowed: Daily, Weekly' });
      }
    const habit = await Habit.create({
      user: req.user,
      title,
      color,
      frequency,
      icon,
      description
    });
    res.status(201).json(habit);
    
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get all habits of logged-in user
const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Delete a habit
const deleteHabit = async (req, res) => {
  try {
    await Habit.findOneAndDelete({ _id: req.params.id, user: req.user });
    res.json({ msg: 'Habit deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  createHabit,
  getHabits,
  deleteHabit
};
