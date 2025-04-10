// models/HabitStatus.js
const mongoose = require('mongoose');

const habitStatusSchema = new mongoose.Schema({
  habit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
});

habitStatusSchema.index({ habit: 1, date: 1 }, { unique: true }); 

module.exports = mongoose.model('HabitStatus', habitStatusSchema);
