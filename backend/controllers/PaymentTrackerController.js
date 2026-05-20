const mongoose = require('mongoose');
const nodemailer = require('nodemailer'); 
const Group = require('../models/Group');
const Member = require('../models/Member');
const User = require('../models/User');
const Tracker = require('../models/Tracker');
const Notification = require('../models/Notification');

// Transporter setup for Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});

/**
 * FETCH LEDGER DATA
 * GET /api/groups/:groupId/contributions
 */
const getGroupContributions = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid Group ID format' });
    }

    const groupDoc = await Group.findById(groupId);
    if (!groupDoc) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const activeMembers = await Member.aggregate([
      {
        $match: { 
          group: groupDoc.groupName,
          memberType: 'Member' 
        } 
      },
      {
        $lookup: {
          from: 'users',          
          localField: 'user',     
          foreignField: 'email',  
          as: 'profile'
        }
      },
      {
        $unwind: {
          path: '$profile',
          preserveNullAndEmptyArrays: true 
        }
      },
      {
        $lookup: {
          from: 'trackers',
          let: { memberId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$memberId', '$$memberId'] },
                    { $eq: ['$groupId', new mongoose.Types.ObjectId(groupId)] }
                  ]
                }
              }
            }
          ],
          as: 'trackingRecord'
        }
      },
      {
        $unwind: {
          path: '$trackingRecord',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          email: { $ifNull: ['$profile.email', '$user'] },
          firstName: { $ifNull: ['$profile.name', 'Unknown'] },
          lastName: { $ifNull: ['$profile.surname', 'Member'] },
          amount: { $literal: groupDoc.contributionAmount },
          status: { $ifNull: ['$trackingRecord.status', 'pending'] }
        }
      }
    ]);

    const formattedPayments = activeMembers.map((m) => ({
      id: m._id,
      firstName: m.firstName.trim(),    
      lastName: m.lastName.trim(), 
      email: m.email,
      amount: m.amount,
      status: m.status        
    }));

    return res.status(200).json(formattedPayments);
  } catch (error) {
    console.error('Error in PaymentTrackerController:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * UPDATE STATUS AND SEND IN-APP NOTIFICATION ONLY
 * PATCH /api/groups/:groupId/contributions/:id
 */
const updateContributionStatus = async (req, res) => {
  try {
    const { groupId, id: memberId } = req.params; 
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: 'Invalid Group or Member ID format' });
    }

    const allowedStatuses = ['paid', 'pending', 'missed', 'flagged'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status type provided' });
    }

    const memberDoc = await Member.findById(memberId);
    if (!memberDoc) {
      return res.status(404).json({ message: 'Member record not found' });
    }
    const targetUserEmail = memberDoc.user;

    const updatedRecord = await Tracker.findOneAndUpdate(
      { memberId, groupId },
      { status },
      { new: true, upsert: true, runValidators: true }
    );

    const groupDoc = await Group.findById(groupId);
    const contextGroupName = groupDoc ? groupDoc.groupName : memberDoc.group;

    // --- ONLY IN-APP NOTIFICATIONS PROCESSED HERE NOW ---
    if (status === 'flagged' || status === 'missed') {
      let title = '';
      let inAppMessage = '';

      if (status === 'flagged') {
        title = 'Payment Status Flagged';
        inAppMessage = `Your payment record for ${contextGroupName} for this cycle has been flagged. Please upload a proof of payment if the payment was made.`;
      } else if (status === 'missed') {
        title = 'Missed Contribution Reminder';
        inAppMessage = 'You have been marked as missed for this cycle. Please be reminded that payments are due.';
      }

      await Notification.create({
        recipient: targetUserEmail, 
        type: 'payment',
        title: title,
        message: inAppMessage,
        groupId: groupId,
        isRead: false,
        details: {
          groupName: contextGroupName
        }
      });
    }

    return res.status(200).json({ 
      success: true,
      message: status === 'flagged' ? 'Notification sent successfully' : 'Status synchronized successfully', 
      data: updatedRecord 
    });

  } catch (error) {
    console.error('Error modifying tracking record fields:', error);
    return res.status(500).json({ message: 'Server error updating tracking target status' });
  }
};

/**
 * BATCH SEND EMAILS TO OUTSTANDING MEMBERS
 * POST /api/groups/:groupId/email-outstanding
 */
const sendBulkEmailReminders = async (req, res) => {
  try {
    const { groupId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(groupId)) return res.status(400).json({ message: 'Invalid Group ID format' });

    const groupDoc = await Group.findById(groupId);
    if (!groupDoc) return res.status(404).json({ message: 'Group not found' });

    const outstandingTrackers = await Tracker.find({ groupId, status: { $in: ['missed', 'flagged'] } });
    if (outstandingTrackers.length === 0) return res.status(200).json({ message: 'No outstanding members found to email.' });

    await Promise.all(outstandingTrackers.map(async (tracker) => {
      const memberDoc = await Member.findById(tracker.memberId);
      if (!memberDoc) return;

      const userProfile = await User.findOne({ email: memberDoc.user });
      const name = userProfile?.name?.trim() || '';
      const surname = userProfile?.surname?.trim() || '';
      const memberFullName = (name || surname) ? `${name} ${surname}`.trim() : 'Stokvel Member';
      const statusLabel = tracker.status.charAt(0).toUpperCase() + tracker.status.slice(1);

      const mailOptions = {
        from: `"Stokvel Assistant" <${process.env.EMAIL_USER}>`,
        to: memberDoc.user,
        subject: `Action Required: Your account has been marked ${statusLabel} in ${groupDoc.groupName}`,
        text: `Dear ${memberFullName},\n\nYour payment record for ${groupDoc.groupName} has been marked as ${statusLabel}.`
      };

      return new Promise((resolve) => {
        transporter.sendMail(mailOptions, (err) => {
          if (err) console.error(`Failed mailing ${memberDoc.user}:`, err);
          resolve();
        });
      });
    }));

    return res.status(200).json({ success: true, message: `Dispatched emails to ${outstandingTrackers.length} members.` });
  } catch (error) {
    console.error('Error in bulk email dispatcher:', error);
    return res.status(500).json({ message: 'Server error processing batch email reminders' });
  }
};

module.exports = { getGroupContributions, updateContributionStatus, sendBulkEmailReminders };