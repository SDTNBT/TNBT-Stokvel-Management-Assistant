const express = require('express');
const router = express.Router();
const { google } = require('googleapis'); 

// --- Models ---
const Agenda = require('../models/Agenda'); 
const Meeting = require('../models/Meeting');
const Notification = require('../models/Notification');
const Member = require('../models/Member');

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

router.post('/agenda', async (req, res) => {
  try {
    const newAgenda = new Agenda(req.body);
    const savedAgenda = await newAgenda.save();
    res.status(201).json({ 
      message: "Agenda successfully posted to MongoDB!", 
      data: savedAgenda 
    });
  } catch (err) {
    console.error("MongoDB Save Error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/agenda/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const groupAgendas = await Agenda.find({ groupId: groupId });
    res.status(200).json(groupAgendas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// SCHEDULING & MEETING ROUTES
// ==========================================

router.post('/schedule', async (req, res) => {
  try {
    let finalMeetingLink = req.body.meetingLink;

    // --- GOOGLE CALENDAR API INTEGRATION ---
    if (req.body.locationType === 'online' && req.body.platform === 'google-meet') {
      try {
        const oauth2Client = new google.auth.OAuth2();
        
        // IMPORTANT: The frontend must send the Google Access Token in the Authorization header
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
              timeZone: 'Africa/Johannesburg',
            },
            end: {
              dateTime: `${req.body.meetingDate}T${req.body.endTime}:00Z`,
              timeZone: 'Africa/Johannesburg',
            },
            conferenceData: {
              createRequest: {
                requestId: `stokvel-${Date.now()}`,
                conferenceSolutionKey: { type: 'hangoutsMeet' }
              }
            },
          };

          const googleResponse = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1,
          });

          finalMeetingLink = googleResponse.data.hangoutLink;
        }
      } catch (googleErr) {
        console.error("Google API Error:", googleErr.message);
        // We continue so the meeting is still saved to Mongo even if Google API fails
      }
    }

    // 1. Save the meeting to MongoDB
    const newMeeting = new Meeting({
        ...req.body,
        meetingLink: finalMeetingLink,
        groupId: req.body.groupId
    });
    const savedMeeting = await newMeeting.save();

    // 2. Find all members of this group
    const groupMembers = await Member.find({ group: req.body.groupId });

    if (groupMembers && groupMembers.length > 0) {
      for (let member of groupMembers) {
        const emailToNotify = member.user.toLowerCase(); 

        // 3. Save in-app notification (Semantic focus: No spans/divs in text)
        await Notification.create({
          recipient: emailToNotify,
          type: 'meeting',
          title: `Meeting Scheduled: ${req.body.meetingTitle}`,
          message: `Meeting on ${req.body.meetingDate} at ${req.body.startTime}. Location: ${req.body.locationType === 'online' ? finalMeetingLink : req.body.physicalLocation}`,
          groupId: req.body.groupId,
          isRead: false 
        });

        // 4. Send Email (Strictly Semantic HTML Tags)
        transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: emailToNotify,
          subject: `Meeting Scheduled: ${req.body.meetingTitle}`,
          html: `
            <article style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee;">
              <header>
                <h2 style="color: #1A3A6B;">Meeting Notification</h2>
                <p>A new meeting has been scheduled for your stokvel group.</p>
              </header>
              <hr/>
              <section>
                <p><strong>Title:</strong> ${req.body.meetingTitle}</p>
                <p><strong>Date:</strong> ${req.body.meetingDate}</p>
                <p><strong>Time:</strong> ${req.body.startTime} - ${req.body.endTime}</p>
                <p><strong>Location:</strong> ${req.body.locationType === 'online' ? finalMeetingLink : req.body.physicalLocation}</p>
              </section>
              <hr/>
              <footer>
                <p>Log in to StokvelStokkie to view more details.</p>
              </footer>
            </article>
          `
        }).catch(err => console.log('Email error:', err.message));
      }
    }

    res.status(201).json(savedMeeting);
  } catch (err) {
    console.error('Meeting schedule error:', err.message);
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