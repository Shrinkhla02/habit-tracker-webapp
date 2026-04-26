const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  completionRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalCompleted: {
    type: Number,
    required: true,
    min: 0
  },
  totalHabits: {
    type: Number,
    required: true,
    min: 0
  },
  streak: {
    type: Number,
    required: true,
    min: 0
  },
  dateRange: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'yearly']
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);