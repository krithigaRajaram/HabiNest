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
  color: {
    type: String,
    default: '#6B7280' 
  },
  frequency: {
    type: String,
    enum: ['Daily', 'Weekly'],
    default: 'Daily'
  },
  icon: {
    type: String,
    default: '🔥' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
