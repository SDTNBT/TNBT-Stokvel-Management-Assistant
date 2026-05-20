// routes/paymentTrackerRoutes.js
const express = require('express');
const router = express.Router();
const PaymentTrackerController = require('../controllers/PaymentTrackerController');


router.get('/:groupId/contributions', PaymentTrackerController.getGroupContributions);
router.patch('/:groupId/contributions/:memberId', PaymentTrackerController.updateContributionStatus);

module.exports = router;