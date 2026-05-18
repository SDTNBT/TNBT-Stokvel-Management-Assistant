const express = require('express');
const router = express.Router();

const {
    schedulePayout,
    updatePayoutStatus,
    getScheduledPayouts,
    getMemberPayouts
} = require('../controllers/payoutController');

// --- THE BOUNCER (Security Middleware) ---
const requireTreasurer = (req, res, next) => {

    const role = req.headers['x-user-role'];

    // Block Members from Treasurer-only actions
    if (role === 'Member') {
        return res.status(403).json({
            message: 'Access denied. Treasurers only.'
        });
    }

    next();
};


// Treasurer Routes


// POST /api/payouts
router.post('/', requireTreasurer, schedulePayout);

// PUT /api/payouts/:id/status
router.put('/:id/status', requireTreasurer, updatePayoutStatus);

// GET /api/payouts/scheduled
router.get('/scheduled', requireTreasurer, getScheduledPayouts);


// Member Routes


// GET /api/payouts/member/:email
router.get('/member/:email', getMemberPayouts);

module.exports = router;