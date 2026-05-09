const mongoose = require('mongoose');

const minutesSchema = new mongoose.Schema({
  // Taken from your URL parameter: /api/minutes/${groupId}
  group: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group', 
    required: true 
  },
  // We'll leave this optional for now unless you pass it from your auth token
  recordedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  // Matching form.meetingDate
  meetingDate: { 
    type: String, 
    required: true 
  },
  // Matching form.meetingTime
  meetingTime: { 
    type: String, 
    required: true 
  },
  // Matching form.notes
  notes: { 
    type: String,
    default: ''
  },
  // Matching form.decisions (Array of Strings)
  decisions: [{ 
    type: String 
  }],
  // Matching form.contributions
  contributions: [{
    member: { 
      type: String, // Changed to String to match your text input!
      required: true 
    },
    amount: { 
      type: Number, 
      required: true 
    },
    status: {
      type: String,
      enum: ['paid', 'unpaid', 'partial'], // Perfectly matches your React <select>
      default: 'paid'
    }
  }]
}, { timestamps: true });

module.exports = mongoose.models.Minutes || mongoose.model('Minutes', minutesSchema);