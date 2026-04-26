const mongoose = require('mongoose');

const authTokenSchema = new mongoose.Schema({
  tokenId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  tokenValue: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AuthToken', authTokenSchema);