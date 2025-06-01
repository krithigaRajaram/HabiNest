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
    enum: ['Daily', 'Weekly','Monthly'],
    default: 'Daily'
  },
 
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
