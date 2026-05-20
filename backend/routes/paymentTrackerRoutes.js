const express = require('express');
const router = express.Router();
const PaymentTrackerController = require('../controllers/PaymentTrackerController');

router.get('/:groupId/contributions', PaymentTrackerController.getGroupContributions);
router.patch('/:groupId/contributions/:id', PaymentTrackerController.updateContributionStatus);

// NEW ENDPOINT LINK FOR THE BULK BUTTON
router.post('/:groupId/email-outstanding', PaymentTrackerController.sendBulkEmailReminders);

module.exports = router;