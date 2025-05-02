const mongoose = require('mongoose');

const RevenueSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  serviceName: {
    type: String,
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Revenue', RevenueSchema); 