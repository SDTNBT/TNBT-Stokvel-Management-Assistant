const express = require('express');
const router = express.Router();

// --- Models ---
const Agenda = require('../models/Agenda');
const Meeting = require('../models/Meeting');
const Notification = require('../models/Notification');
const Member = require('../models/Member');
const Group = require('../models/Group');

// --- Email Setup ---
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ==========================================
// AGENDA ROUTES
// ==========================================

// POST /meetings/agenda - Save a new agenda
router.post('/agenda', async (req, res) => {
  try {
    const newAgenda = new Agenda(req.body);
    const savedAgenda = await newAgenda.save();

    res.status(201).json({
      message: 'Agenda successfully posted to MongoDB!',
      data: savedAgenda
    });
  } catch (err) {
    console.error('MongoDB Save Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /meetings/agenda/:groupId - Fetch agendas for a specific group
router.get('/agenda/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const groupAgendas = await Agenda.find({ groupId });

    res.status(200).json(groupAgendas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// SCHEDULING & MEETING ROUTES
// ==========================================

// POST /meetings/schedule — save meeting and notify all group members
router.post('/schedule', async (req, res) => {
  try {
    // 1. Save the meeting
    const newMeeting = new Meeting(req.body);
    const savedMeeting = await newMeeting.save();

    // 2. Find the group using the groupId from the meeting
    const group = await Group.findById(req.body.groupId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found.' });
    }

    const groupName = group.groupName.trim();

    // 3. Find all members using group name
    const groupMembers = await Member.find({
      group: groupName
    });

    // 4. Remove duplicate members by email
    const uniqueMembers = [
      ...new Map(
        groupMembers.map(member => [member.user.toLowerCase(), member])
      ).values()
    ];

    console.log('Meeting groupId:', req.body.groupId);
    console.log('Resolved groupName:', groupName);
    console.log('Members found:', groupMembers.length);
    console.log('Unique members found:', uniqueMembers.length);

    // 5. Create notifications
    if (uniqueMembers.length > 0) {
      for (let member of uniqueMembers) {
        await Notification.create({
          recipient: member.user.toLowerCase(),
          type: 'meeting',
          title: `Meeting Scheduled: ${savedMeeting.meetingTitle}`,

          // Message now uses the meeting description/purpose only
          message: savedMeeting.purpose || 'A new meeting has been scheduled.',

          groupId: savedMeeting.groupId,
          meetingId: savedMeeting._id,

          details: {
            groupName,
            meetingTitle: savedMeeting.meetingTitle,
            meetingDate: savedMeeting.meetingDate,
            startTime: savedMeeting.startTime,
            endTime: savedMeeting.endTime,
            locationType: savedMeeting.locationType,
            platform: savedMeeting.platform,
            meetingLink: savedMeeting.meetingLink,
            physicalLocation: savedMeeting.physicalLocation,
            purpose: savedMeeting.purpose
          }
        });

        // Optional email notification
        transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: member.user,
          subject: `Meeting Scheduled: ${savedMeeting.meetingTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee;">
              <h2 style="color: #1A3A6B;">Meeting Notification</h2>
              <p>A new meeting has been scheduled for your stokvel group.</p>
              <hr/>
              <p><strong>Group:</strong> ${groupName}</p>
              <p><strong>Title:</strong> ${savedMeeting.meetingTitle}</p>
              <p><strong>Date:</strong> ${savedMeeting.meetingDate}</p>
              <p><strong>Time:</strong> ${savedMeeting.startTime} - ${savedMeeting.endTime}</p>
              <p><strong>Location:</strong> ${
                savedMeeting.locationType === 'online'
                  ? savedMeeting.meetingLink || savedMeeting.platform || 'Online'
                  : savedMeeting.physicalLocation
              }</p>
              ${
                savedMeeting.purpose
                  ? `<p><strong>Description:</strong> ${savedMeeting.purpose}</p>`
                  : ''
              }
              <hr/>
              <p>Log in to StokvèlHub to view more details.</p>
            </div>
          `
        }).catch(err => console.log('Email error:', err.message));
      }

      console.log(`✅ Notifications sent to ${uniqueMembers.length} unique members`);
    } else {
      console.log('⚠️ No members found for this group. No notifications created.');
    }

    res.status(201).json({
      message: 'Meeting scheduled successfully.',
      meeting: savedMeeting,
      notificationsSent: uniqueMembers.length
    });
  } catch (err) {
    console.error('Meeting schedule error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /meetings — fetch all meetings
router.get('/', async (req, res) => {
  try {
    const meetings = await Meeting.find().sort({ meetingDate: 1 });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /meetings/group/:groupId — fetch meetings for a specific group
router.get('/group/:groupId', async (req, res) => {
  try {
    const meetings = await Meeting.find({ groupId: req.params.groupId })
      .sort({ meetingDate: 1 });

    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;