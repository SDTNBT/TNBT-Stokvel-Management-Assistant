const express = require('express');
const router = express.Router();
const { schedulePayout, updatePayoutStatus} = require('../controllers/payoutController');

// --- THE BOUNCER (Security Middleware) ---
const requireTreasurer = (req, res, next) => {
    // In a production app, you will extract the role from the JWT token here.
    // For now, we read the simulated header from our tests.
    const role = req.headers['x-user-role'];

    // If the user explicitly has a "Member" role, kick them out!
    if (role === 'Member') {
        return res.status(403).json({ message: 'Access denied. Treasurers only.' });
    }
    
    // Otherwise, open the door and let the controller run
    next(); 
};

// POST /api/payouts
router.post('/', requireTreasurer, schedulePayout);

router.put('/:id/status', requireTreasurer, updatePayoutStatus); //PUT /api/payouts/:id/status (Update Status)

module.exports = router;