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

  meetingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting'
  },

  details: {
    groupName: String,

    // Meeting fields
    meetingTitle: String,
    meetingDate: String,
    startTime: String,
    endTime: String,
    locationType: String,
    platform: String,
    meetingLink: String,
    physicalLocation: String,
    purpose: String,

    // Agenda fields
    agendaTitle: String,
    agendaDate: String,
    agendaTime: String,
    agendaContent: String
  },

  action: {
    type: { type: String, enum: ['invite'], default: null },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);