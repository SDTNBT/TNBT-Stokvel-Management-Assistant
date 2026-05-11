// backend/models/Payout.js
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
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: [0.01, 'Payout amount must be greater than zero'] // This handles Rule 2 automatically!
  },
  payoutDate: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Scheduled', 'Paid', 'Cancelled'],
    default: 'Scheduled' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);