const express = require('express');
const router = express.Router();
const { schedulePayout } = require('../controllers/payoutController');

// POST /api/payouts
router.post('/', schedulePayout);

module.exports = router;