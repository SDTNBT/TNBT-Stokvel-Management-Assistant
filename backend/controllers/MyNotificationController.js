const Notification = require('../models/Notification');

/**
 * FETCH MEMBER NOTIFICATIONS
 * GET /api/notifications?email=member@email.com
 */
const getMemberNotifications = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: 'User email is required' });
    }

    // CHANGE: Use 'recipient' to match your MongoDB schema exactly
    const feed = await Notification.find({ recipient: email })
                                   .sort({ createdAt: -1 });

    return res.status(200).json(feed);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
/**
 * MARK A SINGLE NOTIFICATION AS READ / DISMISSED
 * PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!updatedNotification) {
      return res.status(404).json({ message: 'Notification document not found' });
    }

    return res.status(200).json({ success: true, data: updatedNotification });
  } catch (error) {
    console.error('Error updating notification read flag:', error);
    return res.status(500).json({ message: 'Server error updating notification status' });
  }
};

module.exports = {
  getMemberNotifications,
  markAsRead
};