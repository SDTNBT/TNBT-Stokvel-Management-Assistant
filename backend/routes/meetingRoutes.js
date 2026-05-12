const express = require('express');
const router = express.Router();
const { google } = require('googleapis');

const Agenda = require('../models/Agenda');
const Meeting = require('../models/Meeting');
const Notification = require('../models/Notification');
const Member = require('../models/Member');
const Group = require('../models/Group');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ===============================
// AGENDA ROUTES
// ===============================

router.post('/agenda', async (req, res) => {
  try {
    const newAgenda = new Agenda(req.body);
    const savedAgenda = await newAgenda.save();

    const group = await Group.findById(req.body.groupId);

    if (!group) {
      return res.status(404).json({
        error: 'Agenda saved, but group not found for notifications.',
        data: savedAgenda
      });
    }

    const groupName = group.groupName.trim();
    const groupMembers = await Member.find({ group: groupName });

    const uniqueMembers = [
      ...new Map(
        groupMembers.map(member => [member.user.toLowerCase(), member])
      ).values()
    ];

    console.log('Agenda groupId:', req.body.groupId);
    console.log('Resolved agenda groupName:', groupName);
    console.log('Agenda members found:', groupMembers.length);
    console.log('Unique agenda members found:', uniqueMembers.length);

    if (uniqueMembers.length > 0) {
      for (let member of uniqueMembers) {
        await Notification.create({
          recipient: member.user.toLowerCase(),
          type: 'announcement',
          title: `Agenda Posted: ${savedAgenda.title}`,
          message: savedAgenda.agenda,
          groupId: savedAgenda.groupId,
          isRead: false,
          details: {
            groupName,
            agendaTitle: savedAgenda.title,
            agendaDate: savedAgenda.date,
            agendaTime: savedAgenda.time,
            agendaContent: savedAgenda.agenda
          }
        });
      }

      console.log(`✅ Agenda notifications sent to ${uniqueMembers.length} unique members`);
    } else {
      console.log('⚠️ No members found for this agenda group. No notifications created.');
    }

    res.status(201).json({
      message: 'Agenda successfully posted and notifications created.',
      data: savedAgenda,
      notificationsSent: uniqueMembers.length
    });
  } catch (err) {
    console.error('Agenda post error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/agenda/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const groupAgendas = await Agenda.find({ groupId });

    res.status(200).json(groupAgendas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// SCHEDULING & MEETING ROUTES
// ===============================

router.post('/schedule', async (req, res) => {
  try {
    let finalMeetingLink = req.body.meetingLink;

    if (req.body.locationType === 'online' && req.body.platform === 'google-meet') {
      try {
        const oauth2Client = new google.auth.OAuth2();

        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
          oauth2Client.setCredentials({ access_token: token });
          const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

          const event = {
            summary: req.body.meetingTitle,
            description: req.body.purpose,
            start: {
              dateTime: `${req.body.meetingDate}T${req.body.startTime}:00Z`,
              timeZone: 'Africa/Johannesburg'
            },
            end: {
              dateTime: `${req.body.meetingDate}T${req.body.endTime}:00Z`,
              timeZone: 'Africa/Johannesburg'
            },
            conferenceData: {
              createRequest: {
                requestId: `stokvel-${Date.now()}`,
                conferenceSolutionKey: { type: 'hangoutsMeet' }
              }
            }
          };

          const googleResponse = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1
          });

          finalMeetingLink = googleResponse.data.hangoutLink;
        }
      } catch (googleErr) {
        console.error('Google API Error:', googleErr.message);
      }
    }

    const newMeeting = new Meeting({
      ...req.body,
      meetingLink: finalMeetingLink,
      groupId: req.body.groupId
    });

    const savedMeeting = await newMeeting.save();

    const group = await Group.findById(req.body.groupId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found.' });
    }

    const groupName = group.groupName.trim();
    const groupMembers = await Member.find({ group: groupName });

    const uniqueMembers = [
      ...new Map(
        groupMembers.map(member => [member.user.toLowerCase(), member])
      ).values()
    ];

    console.log('Meeting groupId:', req.body.groupId);
    console.log('Resolved groupName:', groupName);
    console.log('Members found:', groupMembers.length);
    console.log('Unique members found:', uniqueMembers.length);

    if (uniqueMembers.length > 0) {
      for (let member of uniqueMembers) {
        const emailToNotify = member.user.toLowerCase();

        await Notification.create({
          recipient: emailToNotify,
          type: 'meeting',
          title: `Meeting Scheduled: ${savedMeeting.meetingTitle}`,
          message: savedMeeting.purpose || 'A new meeting has been scheduled.',
          groupId: savedMeeting.groupId,
          meetingId: savedMeeting._id,
          isRead: false,
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

        transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: emailToNotify,
          subject: `Meeting Scheduled: ${savedMeeting.meetingTitle}`,
          html: `
            <article style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee;">
              <header>
                <h2 style="color: #1A3A6B;">Meeting Notification</h2>
                <p>A new meeting has been scheduled for your stokvel group.</p>
              </header>
              <hr/>
              <section>
                <p><strong>Group:</strong> ${groupName}</p>
                <p><strong>Title:</strong> ${savedMeeting.meetingTitle}</p>
                <p><strong>Date:</strong> ${savedMeeting.meetingDate}</p>
                <p><strong>Time:</strong> ${savedMeeting.startTime} - ${savedMeeting.endTime}</p>
                <p><strong>Location:</strong> ${
                  savedMeeting.locationType === 'online'
                    ? savedMeeting.meetingLink || savedMeeting.platform || 'Online'
                    : savedMeeting.physicalLocation || 'Not provided'
                }</p>
                ${
                  savedMeeting.purpose
                    ? `<p><strong>Description:</strong> ${savedMeeting.purpose}</p>`
                    : ''
                }
              </section>
              <hr/>
              <footer>
                <p>Log in to StokvelStokkie to view more details.</p>
              </footer>
            </article>
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

router.get('/', async (req, res) => {
  try {
    const meetings = await Meeting.find().sort({ meetingDate: 1 });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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