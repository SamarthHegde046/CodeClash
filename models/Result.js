// backend/models/Result.js
const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submissionTime: Date,
    passed: Boolean
  }],
  question: {
    type: Object,
    required: true
  },
  duration: {
    type: Number, // in seconds
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Result', resultSchema);
