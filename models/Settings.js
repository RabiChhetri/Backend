const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  availableSeats: {
    type: Number,
    required: true,
    default: 0
  }
});

module.exports = mongoose.model('Settings', settingsSchema); 