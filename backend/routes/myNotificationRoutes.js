const express = require('express');
const router = express.Router();

// 👇 FIXED: Names now match your controller exports exactly
const { 
  getMemberNotifications, 
  markAsRead 
} = require('../controllers/MyNotificationController');

// Route to get a member's notifications via query parameter (?email=...)
router.get('/my-notifications', getMemberNotifications);

// Route to mark a specific notification ID as read
router.patch('/:id/read', markAsRead);

module.exports = router;