const Habit = require('../models/Habit');

// POST /api/habits
const createHabit = async (req, res) => {
  try {
    const { title, description, frequency, scheduledDay, scheduledDate } = req.body;

    if (!title || !title.trim())
      return res.status(400).json({ msg: 'Title is required' });

    if (!['Daily', 'Weekly', 'Monthly'].includes(frequency))
      return res.status(400).json({ msg: 'Invalid frequency' });

    if (frequency === 'Weekly' && (scheduledDay === undefined || scheduledDay === null))
      return res.status(400).json({ msg: 'scheduledDay is required for weekly habits' });

    if (frequency === 'Monthly' && (scheduledDate === undefined || scheduledDate === null))
      return res.status(400).json({ msg: 'scheduledDate is required for monthly habits' });

    const habit = await Habit.create({
      user: req.user,
      title: title.trim(),
      description: description?.trim() || '',
      frequency,
      scheduledDay,
      scheduledDate,
    });

    res.status(201).json(habit);
  } catch (err) {
    console.error('createHabit error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// GET /api/habits
const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    console.error('getHabits error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// GET /api/habits/:id
const getHabitById = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user });
    if (!habit) return res.status(404).json({ msg: 'Habit not found' });
    res.json(habit);
  } catch (err) {
    console.error('getHabitById error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// PUT /api/habits/:id
const updateHabit = async (req, res) => {
  try {
    const { title, description, frequency, scheduledDay, scheduledDate } = req.body;

    const habit = await Habit.findOne({ _id: req.params.id, user: req.user });
    if (!habit) return res.status(404).json({ msg: 'Habit not found' });

    if (title !== undefined) habit.title = title.trim();
    if (description !== undefined) habit.description = description.trim();
    if (frequency !== undefined) habit.frequency = frequency;
    if (scheduledDay !== undefined) habit.scheduledDay = scheduledDay;
    if (scheduledDate !== undefined) habit.scheduledDate = scheduledDate;

    await habit.save();
    res.json(habit);
  } catch (err) {
    console.error('updateHabit error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// DELETE /api/habits/:id
const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user });
    if (!habit) return res.status(404).json({ msg: 'Habit not found' });
    res.json({ msg: 'Habit deleted successfully' });
  } catch (err) {
    console.error('deleteHabit error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { createHabit, getHabits, getHabitById, updateHabit, deleteHabit };