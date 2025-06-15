const HabitStatus = require('../models/HabitStatus');
const Habit       = require('../models/Habit');

/* helper: start + end of a given yyyy‑mm‑dd string (UTC) */
const dayRange = (d) => ({
  start: new Date(`${d}T00:00:00.000Z`),
  end:   new Date(`${d}T23:59:59.999Z`)
});

/* ---------- POST /api/habit-status ---------- */
const updateHabitStatus = async (req, res) => {
  try {
    const { habitId, date, completed } = req.body;
    const { start } = dayRange(date);              // normalise to 00:00 UTC

    const status = await HabitStatus.findOneAndUpdate(
      { habit: habitId, date: start },
      { completed },
      { upsert: true, new: true }
    ).lean();

    res.json(status);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

/* ---------- GET /api/habit-status/:date ---------- */
const getStatusByDate = async (req, res) => {
  try {
    const { start, end } = dayRange(req.params.date);

    /* all habit ids that belong to this user */
    const habitIds = await Habit
      .find({ user: req.user })
      .distinct('_id');

    /* statuses for those habits within the day */
    const statuses = await HabitStatus.find({
      habit: { $in: habitIds },
      date:  { $gte: start, $lte: end }
    }).select('habit completed').lean();            // [{ habit, completed }]

    res.json(statuses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { updateHabitStatus, getStatusByDate };
