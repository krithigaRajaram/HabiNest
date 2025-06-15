const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  frequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly'],
    default: 'Daily'
  },
  scheduledDay: {
    type: Number,
    min: 0,
    max: 6,
    required: function () {
      return this.frequency === 'Weekly';
    }
  },
  scheduledDate: {
    type: Number,
    min: 1,
    max: 31,
    required: function () {
      return this.frequency === 'Monthly';
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
