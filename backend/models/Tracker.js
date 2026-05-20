const mongoose = require('mongoose');

const TrackerSchema = new mongoose.Schema({
  memberId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Member', 
    required: true 
  },
  groupId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Group', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['paid', 'pending', 'missed', 'flagged'], 
    default: 'pending' 
  }
}, { timestamps: true });

// Ensures a member only has one tracking record per group
TrackerSchema.index({ memberId: 1, groupId: 1 }, { unique: true });

module.exports = mongoose.model('Tracker', TrackerSchema);