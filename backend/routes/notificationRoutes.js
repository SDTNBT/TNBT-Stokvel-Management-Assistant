const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Member = require('../models/Member');
const Group = require('../models/Group');

// GET /api/notifications/:email — fetch notifications for a member
router.get('/:email', async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      recipient: req.params.email.toLowerCase()
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/:id/read — mark one as read
router.put('/:id/read', async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications — create a notification manually
router.post('/', async (req, res) => {
  try {
    const { recipient, type, title, message, groupId } = req.body;
    const notification = await Notification.create({
      recipient: recipient.toLowerCase(),
      type,
      title,
      message,
      groupId
    });
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept invite (DIAGNOSTIC VERSION)
router.put('/:id/accept', async (req, res) => { 
  console.log(`\n--- ACCEPT INVITE TRIGGERED for Notification ID: ${req.params.id} ---`);
  
  try {
    // 1. Find the notification
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      console.log("❌ ERROR: Notification not found in DB!");
      return res.status(404).json({ error: 'Notification not found' });
    }
    console.log(`✅ Notification found! Group ID: ${notification.groupId}, Recipient: ${notification.recipient}`);

    // 2. Fetch the Group using the groupId to get its actual name
    const groupData = await Group.findById(notification.groupId);
    if (!groupData) {
      console.log("❌ ERROR: Group ID from notification does not exist in the Group database!");
      return res.status(404).json({ error: 'Group no longer exists' });
    }
    
    const actualGroupName = groupData.groupName;
    console.log(`✅ Group found! Name: "${actualGroupName}"`);

    // 3. Check if they are already a member
    const existingMember = await Member.findOne({
      user: notification.recipient,
      group: actualGroupName 
    });

    if (existingMember) {
      console.log("⚠️ SKIPPED: Database says this user is ALREADY a member of this group.");
    }

    // 4. Create their Member profile
    if (!existingMember) {
      console.log("⚙️ Creating new Member document...");
      const newMember = await Member.create({
        user: notification.recipient,  
        group: actualGroupName,        
        memberType: 'Member'           
      });
      console.log("✅ SUCCESS! Member officially created in database:", newMember);
    }
    
    // 5. Update the notification status
    notification.isRead = true;
    notification.action = {
      type: 'invite',
      status: 'accepted'
    };
    
    await notification.save();
    console.log("✅ Notification status updated to 'accepted'!");
    
    res.json({ success: true });
    
  } catch (err) {
    console.error("❌ CRITICAL ERROR IN ACCEPT ROUTE:", err);
    res.status(500).json({ error: err.message });
  }
});

// Decline invite
router.put('/:id/decline', async (req, res) => { // Removed the extra /notifications
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Update notification
    notification.isRead = true;
    notification.action = {
      type: 'invite',
      status: 'declined'
    };
    
    await notification.save();
    res.json({ success: true });
    
  } catch (err) {
    console.error("Error declining invite:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;