const express = require('express');
const router = express.Router();
const { getMemberAnalytics } = require('../controllers/analyticsController');

// GET /api/analytics/member
// Query params supported: ?startDate=YYYY-MM-DD & endDate=YYYY-MM-DD & format=csv
router.get('/member', getMemberAnalytics);

module.exports = router;