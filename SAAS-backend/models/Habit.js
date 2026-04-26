const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  notes: String,
  reminder: {
    type: String,
    enum: ['morning', 'afternoon', 'evening'],
    default: 'morning'
  },
  reminderTime: {
    type: String,
    default: 'None'
  },
  reminderDate: {
    type: String,
    default: null
  },
  reminderFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: null
  },
  daysOfWeek: {
    type: [String],
    enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    default: []
  },
  dayOfMonth: {
    type: Number,
    min: 1,
    max: 31,
    default: null
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['health', 'fitness', 'learning', 'productivity', 'other'],
    default: 'other'
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  bestStreak: {
    type: Number,
    default: 0
  },
  lastCompletedDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);