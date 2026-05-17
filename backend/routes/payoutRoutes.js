const express = require('express');
const router = express.Router();
const { schedulePayout, updatePayoutStatus,
    getNextScheduled,      // <-- Added this
    getPendingPayouts,     // <-- Added this
    initiatePayout,         // <-- Added this
    getScheduledPayouts    // Gomolemo's original controller function, still here if we need it
} = require('../controllers/payoutController');

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
// Gomolemo's routes:
// POST /api/payouts
router.post('/', requireTreasurer, schedulePayout);

// PUT /api/payouts/:id/status (Update Status)
router.put('/:id/status', requireTreasurer, updatePayoutStatus); 

// GET /api/payouts/scheduled (For the Treasurer Dashboard)
// Added the bouncer here so only Treasurers can see the full scheduled list
router.get('/scheduled', requireTreasurer, getScheduledPayouts);

// my new routes:
router.get('/:groupName/next', requireTreasurer, getNextScheduled); 
router.get('/:groupName/pending', requireTreasurer, getPendingPayouts);
router.post('/initiate', requireTreasurer, initiatePayout);

module.exports = router;