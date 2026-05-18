const express = require('express');
const router = express.Router();

const {
  schedulePayout,
  updatePayoutStatus,
  getScheduledPayouts,
  getMemberPayouts
} = require('../controllers/payoutController');

const requireTreasurer = (req, res, next) => {
  const role = req.headers['x-user-role'];

  if (role === 'Member') {
    return res.status(403).json({
      message: 'Access denied. Treasurers only.'
    });
  }

  next();
};

// Treasurer schedules a payout
router.post('/', requireTreasurer, schedulePayout);

// Treasurer updates payout status
router.put('/:id/status', requireTreasurer, updatePayoutStatus);

// Treasurer views scheduled/processing payouts
router.get('/scheduled', requireTreasurer, getScheduledPayouts);

// Member views own payout history
router.get('/member/:email', getMemberPayouts);

module.exports = router;