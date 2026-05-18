const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true
  },

  userId: {
    type: String,
    required: true
  },

  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },

  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Payout amount must be greater than zero']
  },

  payoutDate: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: ['Scheduled', 'Processing', 'Paid', 'Cancelled', 'Failed'],
    default: 'Scheduled'
  },

  bankName: {
    type: String
  },

  accountHolder: {
    type: String
  },

  accountNumberLast4: {
    type: String
  },

  paymentReference: {
    type: String
  },

  paidAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);