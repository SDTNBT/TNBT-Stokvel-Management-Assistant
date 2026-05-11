const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['meeting', 'payment', 'announcement', 'invite'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  groupId: { type: String },

  action: {
    type:    { type: String, enum: ['invite'], default: null },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    status:  { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);