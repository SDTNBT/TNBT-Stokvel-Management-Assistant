const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({

  // Group info — groupName required by your system, groupId optional for teammate's frontend
  groupName: {
    type: String,
    required: false // kept flexible so both your code and teammate's code works
  },
  groupId: {
    type: String // teammate's frontend sends groupId sometimes
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

  // Merged statuses from both branches — yours use capitals, teammate uses lowercase
  // Kept all so existing DB records don't break
  status: {
    type: String,
    enum: ['Scheduled', 'Processing', 'Paid', 'Cancelled', 'Failed', 'pending', 'failed'],
    default: 'Scheduled'
  },

  // Your banking detail fields
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
  },

  // Teammate's extra fields
  method: { type: String },   // 'bank' or 'cash'
  reference: { type: String }, // EFT reference
  notes: { type: String }      // extra context

}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);