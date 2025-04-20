const Habit = require('../models/Habit');

const createHabit = async (req, res) => {
  try {
    const { title, color, frequency, icon, description } = req.body;
    
    if (!title) {
        return res.status(400).json({ msg: 'Missing required fields' });
      }
      
      if (!req.user) {
        return res.status(401).json({ msg: 'Unauthorized' });
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


const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

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
