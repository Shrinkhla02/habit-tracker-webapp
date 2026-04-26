const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  reminderId: {
    type: String,
    required: true,
    unique: true
  },
  habitId: {
    type: String,
    required: true,
    ref: 'Habit'
  },
  habit: {
    type: String,
    required: false
  },
  date: {
    type: String,
    required: false
  },
  time: {
    type: String,
    required: false
  },
  channel: {
    type: String,
    required: false
  },
  tone: {
    type: String,
    required: false
  },
  timeOfDay: {
    type: String,
    required: false
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reminder', reminderSchema);