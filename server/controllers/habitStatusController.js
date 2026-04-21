const HabitStatus = require('../models/HabitStatus');
const Habit = require('../models/Habit');
const { dayRange } = require('../utils/dateHelpers');

// POST /api/habit-status
const updateHabitStatus = async (req, res) => {
  try {
    const { habitId, date, completed } = req.body;

    if (!habitId || !date || completed === undefined)
      return res.status(400).json({ msg: 'habitId, date, and completed are required' });

    // Verify the habit belongs to this user
    const habit = await Habit.findOne({ _id: habitId, user: req.user });
    if (!habit) return res.status(404).json({ msg: 'Habit not found' });

    const { start } = dayRange(date);

    const status = await HabitStatus.findOneAndUpdate(
      { habit: habitId, date: start },
      { completed },
      { upsert: true, new: true }
    ).lean();

    res.json(status);
  } catch (err) {
    console.error('updateHabitStatus error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// GET /api/habit-status/:date
const getStatusByDate = async (req, res) => {
  try {
    const { start, end } = dayRange(req.params.date);

    const habitIds = await Habit.find({ user: req.user }).distinct('_id');

    const statuses = await HabitStatus.find({
      habit: { $in: habitIds },
      date: { $gte: start, $lte: end },
    })
      .select('habit completed date')
      .lean();

    res.json(statuses);
  } catch (err) {
    console.error('getStatusByDate error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// GET /api/habit-status/streak/:habitId
const getStreak = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.habitId, user: req.user });
    if (!habit) return res.status(404).json({ msg: 'Habit not found' });

    const statuses = await HabitStatus.find({
      habit: req.params.habitId,
      completed: true,
    })
      .sort({ date: -1 })
      .lean();

    if (!statuses.length) return res.json({ currentStreak: 0, longestStreak: 0 });

    // Build a set of completed date strings for fast lookup
    const completedDates = new Set(
      statuses.map((s) => s.date.toISOString().split('T')[0])
    );

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    const cursor = new Date(today);
    cursor.setUTCHours(0, 0, 0, 0);

    while (true) {
      const key = cursor.toISOString().split('T')[0];
      if (!completedDates.has(key)) break;
      currentStreak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    // Calculate longest streak
    const sortedDates = [...completedDates].sort();
    let longestStreak = 1;
    let tempStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    res.json({ currentStreak, longestStreak });
  } catch (err) {
    console.error('getStreak error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// GET /api/habit-status/habit/:habitId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
const getHabitHistory = async (req, res) => {
  try {
    const { habitId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify the habit belongs to this user
    const habit = await Habit.findOne({ _id: habitId, user: req.user });
    if (!habit) return res.status(404).json({ msg: 'Habit not found' });

    if (!startDate || !endDate) {
      return res.status(400).json({ msg: 'startDate and endDate are required' });
    }

    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    const statuses = await HabitStatus.find({
      habit: habitId,
      date: { $gte: start, $lte: end }
    })
      .select('date completed')
      .sort({ date: 1 })
      .lean();

    res.json(statuses);
  } catch (err) {
    console.error('getHabitHistory error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { updateHabitStatus, getStatusByDate, getStreak, getHabitHistory };