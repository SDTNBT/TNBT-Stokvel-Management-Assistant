const express = require('express');
const router = express.Router();

const {
  schedulePayout,
  updatePayoutStatus,
  getScheduledPayouts,
  getMemberPayouts,
  getNextScheduled,
  getPendingPayouts,
  initiatePayout
} = require('../controllers/payoutController');

// ==========================================
// SECURITY MIDDLEWARE — Treasurer only
// ==========================================

const requireTreasurer = (req, res, next) => {
  const role = req.headers['x-user-role'];

  if (role === 'Member') {
    return res.status(403).json({
      message: 'Access denied. Treasurers only.'
    });
  }

  next();
};

router.get('/:groupName/next', requireTreasurer, getNextScheduled); 
router.get('/:groupName/pending', requireTreasurer, getPendingPayouts);
router.post('/initiate', requireTreasurer, initiatePayout);

// ==========================================
// TREASURER ROUTES
// ==========================================

// POST /api/payouts — schedule a payout
router.post('/', requireTreasurer, schedulePayout);

// PUT /api/payouts/:id/status — update payout status
router.put('/:id/status', requireTreasurer, updatePayoutStatus);

// GET /api/payouts/scheduled — get all scheduled payouts for dashboard
router.get('/scheduled', requireTreasurer, getScheduledPayouts);

// ==========================================
// MEMBER ROUTES
// ==========================================

// GET /api/payouts/member/:email — get payout history for a member
router.get('/member/:email', getMemberPayouts);

module.exports = router;