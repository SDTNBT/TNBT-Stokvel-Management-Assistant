const mongoose = require('mongoose');

const BankingDetailsSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    unique: true
  },
  bankName: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true
  },
  accountHolder: {
    type: String,
    required: [true, 'Account holder name is required'],
    trim: true
  },
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('BankingDetails', BankingDetailsSchema);